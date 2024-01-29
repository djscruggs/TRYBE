import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import ChallengeForm from '~/components/form-challenge';
import {loadChallenge} from '~/utils/challenge.server'
import { useLoaderData, useRouteLoaderData, useFetcher } from '@remix-run/react';
import { requireCurrentUser } from "../utils/auth.server"
import type {ObjectData} from '~/utils/types.server'
import { json, LoaderFunction } from "@remix-run/node"; 
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node"; // or cloudflare/deno
import {loader as challengeLoader} from './challenges.$id'
// import { useRouteLoaderData } from '@remix-run/react';

export const loader: LoaderFunction = async ({ request, params, context }) => {
  return challengeLoader({ request, params, context })
}
export default function EditChallenge() {
  const data: ObjectData  = useLoaderData()
  if(data?.loadingError){
    return <h1>{data.loadingError}</h1>
  }
   
  if(!data?.object){
    return <p>Loading.</p> 
  }
  
  
  return (
    <ChallengeForm object={data.object}/>
  );
}