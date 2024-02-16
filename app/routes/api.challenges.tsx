
import ChallengeForm from '~/components/form-challenge';
import {createChallenge, updateChallenge, challengeSchema} from '~/utils/challenge.server'
import type {ErrorObject, ObjectData} from '~/utils/types.server'
import { useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import { requireCurrentUser, getUserSession, storage } from "~/utils/auth.server"
import { json, redirect, LoaderFunction } from "@remix-run/node"; 
import type { ActionFunctionArgs} from "@remix-run/node"; // or cloudflare/deno
import { useActionData } from "@remix-run/react";
import {convertStringValues} from '../utils/helpers'

export async function action({
  request,
}: ActionFunctionArgs) {
  const currentUser = await requireCurrentUser(request)
  const formData = Object.fromEntries(await request.formData());
  const cleanData = convertStringValues(formData)
  try {
    
    const validation = challengeSchema.safeParse(cleanData)
    if (!validation.success) {
      console.log('validation error')
      console.log(validation.error.format())
      return({
        formData,
        errors: validation.error.format()
      })
    }
    //convert types where necessary
    let converted = cleanData
    converted.endAt = converted.endAt ? new Date(converted.endAt).toISOString() : null
    converted.startAt = converted.startAt ? new Date(converted.startAt).toISOString() : null;
    converted.publishAt = converted.publishAt ? new Date(converted.startAt).toISOString() : new Date().toISOString();
    let data;
    if(formData.id) {
      data = await updateChallenge(converted)
    } else {
      data = await createChallenge(converted)
    }
    console.log('result from prisma')
    console.log(data)
    return (data)
    
  } catch(error){
    console.log('error', error)
    return {
      formData,
      error
    }
  }
  
}
export const loader: LoaderFunction = async ({ request }) => {
  const currentUser = await requireCurrentUser(request)
  return json({ message: 'This route does not accept GET requests' }, 200);
}