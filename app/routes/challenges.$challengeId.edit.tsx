import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import ChallengeForm from '~/components/form-challenge';
import {loadChallenge} from '~/utils/challenge.server'
import { useLoaderData } from '@remix-run/react';
import { requireCurrentUser } from "../utils/auth.server"
import type {ObjectData} from '~/utils/types.server'
import { json, LoaderFunction } from "@remix-run/node"; 
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node"; // or cloudflare/deno

export const loader: LoaderFunction = async ({ request, params }) => {
  const currentUser = await requireCurrentUser(request)
  if(!params.challengeId){
    return json({loadingError: 'No challenge id submitted'})
  }
  console.log('loading from edit with params', params)
  const result = await loadChallenge(params.challengeId, currentUser?.id)
  
  if(!result){
    console.log('retirning error')
    const error = {loadingError: 'Challenge not found'}
    return json(error)
  }
  console.log('retirning oject')
  const data: ObjectData = {object: result} 
  console.log(data)
  return json(data)
}
export default function EditChallenge() {
  const data: ObjectData  = useLoaderData()
  if(data?.loadingError){
    return <h1>{data.loadingError}</h1>
  }
  if(!data.object){
    return '<p>Loading...</p>'
  }
  
  
  return (
    <ChallengeForm object={data.object}/>
  );
}