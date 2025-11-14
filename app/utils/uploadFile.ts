import { v2 as cloudinary } from 'cloudinary'
import type { UploadApiResponse } from 'cloudinary'
import { Prisma } from '@prisma/client'
import { promises as fs } from 'fs';
import { type FileUpload } from '@remix-run/form-data-parser';

export async function writeFile(file: File): Promise<string> {
  const directory = `${process.cwd()}/public/uploads`;
  await fs.mkdir(directory, { recursive: true });

  const buffer = await file.arrayBuffer();
  const ext = file.name.split('.').pop();
  const newName = `${Date.now()}.${ext}`;
  const dest = `${directory}/${newName}`;

  await fs.writeFile(dest, Buffer.from(buffer));

  return `/uploads/${newName}`;
}

export const memoryUploadHandler = async (file: FileUpload) => {
  const chunks = [];
  for await (const chunk of file.data) {
    chunks.push(chunk);
  }
  const buffer = Buffer.concat(chunks);
  return new File([buffer], file.name, { type: file.type });
};

export const saveBufferToCloudinary = (
  buffer: Buffer,
  nameWithoutExtension: string
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        use_filename: false,
        unique_filename: false,
        public_id: nameWithoutExtension,
        overwrite: true,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};

type ResourceType = 'image' | 'video'
export const deleteFromCloudinary = async (publicId: string, type: ResourceType): Promise<void> => {
  await cloudinary.uploader.destroy(publicId, { resource_type: type })
}

function escapeRegExp (string: string): string {
  return string.replace(/[.*+?^${}()|[\\]/g, '\\$&'); // $& means the whole matched string
}

interface DataObj {
  id: number
  imageMeta: UploadApiResponse | null
  videoMeta: UploadApiResponse | null
}
interface FormUploadProps {
  formData: FormData
  dataObj: DataObj
  nameSpace: string // how should we name the file? i.e. note-5.jpeg or thread-2.mp4
  onUpdate: (dataObj: DataObj) => Promise<DataObj>
}

export const handleFormUpload = async ({ formData, dataObj, nameSpace, onUpdate }: FormUploadProps): Promise<DataObj> => {
  // check if there is a video/image OR if it should be deleted
  let image, video
  let shouldUpdate = false
  if (formData.get('image') && formData.get('image') !== 'delete') {
    image = formData.get('image') as File
  }
  try {
    if (image ?? formData.get('image') === 'delete') {
      shouldUpdate = true
      // delete existing file if it exists
      if (dataObj.imageMeta?.public_id) {
        await deleteFromCloudinary(String(dataObj.imageMeta.public_id), 'image')
      }
      if (image) {
        const imgNoExt = `${nameSpace}-${dataObj.id}-image`
        const buffer = await image.arrayBuffer()
        const imgMeta = await saveBufferToCloudinary(Buffer.from(buffer), imgNoExt)
        dataObj.imageMeta = imgMeta
      } else {
        dataObj.imageMeta = Prisma.DbNull
      }
    }
  } catch (error) {
    console.error('error uploading image', error)
  }
  if (formData.get('video') && formData.get('video') !== 'delete') {
    video = formData.get('video') as File
  }
  try {
    if (video ?? formData.get('video') === 'delete') {
      shouldUpdate = true
      // delete existing file if it exists
      if (dataObj.videoMeta?.public_id) {
        await deleteFromCloudinary(String(dataObj.videoMeta.public_id), 'video')
      }
      if (video) {
        const vidNoExt = `${nameSpace}-${dataObj.id}-video`
        const buffer = await video.arrayBuffer()
        const videoMeta = await saveBufferToCloudinary(Buffer.from(buffer), vidNoExt)
        dataObj.videoMeta = videoMeta
      } else {
        dataObj.videoMeta = Prisma.DbNull
      }
    }
  } catch (error) {
    console.error('error uploading video', error)
  }
  if (shouldUpdate) {
    await onUpdate(dataObj)
  }
  return dataObj
}