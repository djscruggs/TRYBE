
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
  console.log(request)
  const currentUser = await requireCurrentUser(request)
  const url = new URL(request.url)
  console.log(url)
  const id = url.searchParams.get('id')
  console.log("id is ", id)
  return json({ message: 'Deleteed' }, 200);
  
  
}
export const loader: LoaderFunction = async ({ request }) => {
  const currentUser = await requireCurrentUser(request)
  return json({ message: 'This route does not accept GET requests' }, 200);
}