import {loadChallenge} from '~/utils/challenge.server'
import { useLoaderData } from '@remix-run/react';
import { requireCurrentUser } from "../utils/auth.server"
import type {  ObjectData} from '~/utils/types.server'
import { json, LoaderFunction } from "@remix-run/node"; 
import { Link } from '@remix-run/react';
import axios from 'axios'

export const loader: LoaderFunction = async ({ request, params }) => {
  const currentUser = await requireCurrentUser(request)
  if(!params.id){
    return null;
  }

  
  const result = await loadChallenge(params.id, currentUser?.id)
  
  if(!result){
    const error = {loadingError: 'Challenge not found'}
    return json(error)
  }
  const data: ObjectData = {object: result} 
  return json(data)
}
export default function ViewChallenge() {
  const data: ObjectData  = useLoaderData()
  if(!data){
    return <p>No data.</p>
  }
  if(data?.loadingError){
    return <h1>{data.loadingError}</h1>
  } 
  if(!data?.object){
    return <p>Loading...</p>
  }
  const handleDelete = async (event:any) => {
    event.preventDefault()
    if(!data.object.id){
      throw ('cannot delete without an id')
    }
    console.log('delete', data.object)
    const url = `/api/challenges/delete/${data.object.id}`
    const response = await axios.post(url);
    console.log(response)
  }
  return (
    <>
    <h1>{data.object.name}</h1>
    <Link className='underline text-red' to = {`/challenges/edit/${data.object.id}`}>edit</Link>&nbsp;&nbsp;
    <Link className='underline text-red' onClick={handleDelete} to = {`/challenges/edit/${data.object.id}`}>delete</Link>&nbsp;&nbsp;
    
    </>
  );
}