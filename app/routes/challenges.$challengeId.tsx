import React, { useState, useEffect } from 'react';
import {loadChallenge} from '~/utils/challenge.server'
import { useLoaderData, useSearchParams } from '@remix-run/react';
import { requireCurrentUser } from "../utils/auth.server"
import type {  ObjectData} from '~/utils/types.server'
import { json, LoaderFunction } from "@remix-run/node"; 
import type {  LoaderFunctionArgs } from "@remix-run/node"; // or cloudflare/deno
import { Outlet } from '@remix-run/react';
import { toast } from 'react-hot-toast';
import { Link } from '@remix-run/react';

export const loader: LoaderFunction = async ({ request, params }) => {
  const currentUser = await requireCurrentUser(request)
  if(!params.challengeId){
    return null;
  }

  console.log('loading from view with params', params)
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
export default function ViewChallenge() {
  const [searchParams] = useSearchParams();
  useEffect(() =>{
    if(searchParams.get('success')){
      toast.success('Challenge created')
    }
  },[])
  
  // console.log(params.get('success'))
  const data: ObjectData  = useLoaderData()
  console.log(data)
  if(data?.loadingError){
    return <h1>{data.loadingError}</h1>
  }
  if(!data.object){
    return '<p>Loading...</p>'
  }
  
  return (
    <>
    <h1>{data.object.name}</h1>
    <Link className='underline text-red' to = {`/challenges/${data.object.id}/edit`}>edit</Link>&nbsp;&nbsp;
    <Outlet/>
    </>
  );
}