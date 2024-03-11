import ChallengeForm from '~/components/form-challenge';
import { useLoaderData } from '@remix-run/react';
import type {ObjectData} from '~/utils/types.server'
import { loadChallenge } from '~/models/challenge.server';
import { json, LoaderFunction } from "@remix-run/node"; 
import { requireCurrentUser } from "../models/auth.server"
// import { useRouteLoaderData } from '@remix-run/react';

export const loader: LoaderFunction = async ({ request, params }) => {
    const currentUser = await requireCurrentUser(request)
    if(!params.id || !currentUser){
      return null;
    }
    const result = await loadChallenge(params.id, currentUser.id)
    if(!result){
      const error = {loadingError: 'Challenge not found'}
      return json(error)
    }
    const data: ObjectData = {object: result}
    return json(data)
  
}
export default function EditChallenge() {
  const data: ObjectData  = useLoaderData() as ObjectData
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