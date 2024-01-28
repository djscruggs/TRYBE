
import ChallengeForm from '~/components/form-challenge';
import {createChallenge, updateChallenge, challengeSchema} from '~/utils/challenge.server'
import type {ErrorObject, ObjectData} from '~/utils/types.server'
import { useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import { requireCurrentUser, getUserSession, storage } from "~/utils/auth.server"
import { json, redirect, LoaderFunction } from "@remix-run/node"; 
import type { ActionFunctionArgs} from "@remix-run/node"; // or cloudflare/deno
import { useActionData } from "@remix-run/react";


export async function action({
  request,
}: ActionFunctionArgs) {
  
  const formData = Object.fromEntries(await request.formData());
  console.log(formData)
  
  try {
    
    const validation = challengeSchema.safeParse(formData)
    if (!validation.success) {
      console.log('validation error')
      console.log(validation.error.format())
      return({
        formData,
        errors: validation.error.format()
      })
    }
    //convert types where necessary
    console.log('inserting')
    let converted = formData
    converted.userId = Number(converted.userId)
    converted.endAt = new Date(converted.endAt).toISOString()
    converted.startAt = new Date(converted.startAt).toISOString()
    let result;
    if(formData.id) {
      result = await createChallenge(formData)
    } else {
      result = await updateChallenge(formData)
    }
    console.log('result from prisma')
    console.log(result)
    return ({success: true, data:result})
    
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