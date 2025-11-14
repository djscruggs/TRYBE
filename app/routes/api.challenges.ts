import { fetchMemberChallenges } from "~/models/user.server";

import {
  createChallenge,
  updateChallenge,
  loadChallengeSummary,
  fetchChallengeSummaries,
} from "~/models/challenge.server";
import { requireCurrentUser } from "~/models/auth.server";
import {
  type LoaderFunction,
  unstable_parseMultipartFormData,
  type ActionFunctionArgs,
} from "react-router";
import { convertStringValues } from "~/utils/helpers";
import {
  uploadHandler,
  saveToCloudinary,
  deleteFromCloudinary,
} from "~/utils/uploadFile";
import { prisma } from "~/models/prisma.server";
import { differenceInDays } from "date-fns";

export async function action(args: ActionFunctionArgs): Promise<any> {
  const currentUser = await requireCurrentUser(args);
  const request = args.request;
  // const rawData = await unstable_parseMultipartFormData(request, uploadHandler) // Not available in React Router v7
  const formData = Object.fromEntries(rawData);
  const cleanData = convertStringValues(formData);
  if (!cleanData.userId) {
    cleanData.userId = currentUser?.id;
  }
  const categories = JSON.parse((cleanData.categories as string) ?? []);
  delete cleanData.categories;
  try {
    const converted = cleanData;
    delete converted.image;
    delete converted.video;
    delete converted.userId;
    delete converted.deleteImage;
    delete converted.coverPhoto;
    converted.endAt = converted.endAt
      ? new Date(converted.endAt as Date).toISOString()
      : null;
    converted.startAt = converted.startAt
      ? new Date(converted.startAt as Date).toISOString()
      : null;
    converted.publishAt = converted.publishAt
      ? new Date(converted.publishAt as Date).toISOString()
      : new Date().toISOString();
    // Calculate numDays if type is "SCHEDULED"
    if (
      converted.type === "SCHEDULED" &&
      converted.startAt &&
      converted.endAt
    ) {
      const startDate = new Date(converted.startAt as string);
      const endDate = new Date(converted.endAt as string);
      const numDays = differenceInDays(endDate, startDate);
      converted.numDays = numDays;
    }
    let data: any;
    if (converted.id) {
      data = await updateChallenge(converted);
    } else {
      converted.userId = currentUser?.id;
      data = await createChallenge(converted);
    }
    // now handle the photo
    let newCoverPhoto;
    // new photo is uploaded as photo, not coverPhoto
    if (rawData.get("image")) {
      newCoverPhoto = rawData.get("image") as File;
    }
    if (rawData.get("deleteImage") === "true") {
      if (data.coverPhotoMeta?.public_id) {
        await deleteFromCloudinary(
          data.coverPhotoMeta?.public_id as string,
          "image"
        );
      }
      data.coverPhotoMeta = {};
    }
    if (newCoverPhoto) {
      const nameNoExt = `challenge-${data.id}-cover`;
      const coverPhotoMeta = await saveToCloudinary(newCoverPhoto, nameNoExt);
      data.coverPhotoMeta = coverPhotoMeta;
    }
    const updatedData = await updateChallenge(data);
    // insert categories
    // delete existing categories first
    await prisma.categoriesOnChallenges.deleteMany({
      where: { challengeId: updatedData.id },
    });
    await prisma.categoriesOnChallenges.createMany({
      data: categories.map((category: any) => ({
        categoryId: category,
        challengeId: updatedData.id,
      })),
    });
    // reload challenge with all the extra info
    const updatedChallenge = await loadChallengeSummary(Number(data.id));
    return updatedChallenge;
  } catch (error) {
    console.error("error", error);
    return {
      formData,
      error,
    };
  }
}

export const loader: LoaderFunction = async (args) => {
  void requireCurrentUser(args);
  return { message: "This route does not accept GET requests" };
};
