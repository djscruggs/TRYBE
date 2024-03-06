import { loadChallenge } from '~/utils/challenge.server'
import { useLoaderData } from '@remix-run/react';
import { useContext } from "react";
import { requireCurrentUser } from "../utils/auth.server"
import type {  ObjectData} from '~/utils/types.server'
import { json, LoaderFunction } from "@remix-run/node"; 
import { Link } from '@remix-run/react';
import { useNavigate } from '@remix-run/react';
import axios from 'axios'
import { toast } from 'react-hot-toast';
import { colorToClassName } from '~/utils/helpers';
import { DateTimeFormatOptions } from 'intl'
import { CurrentUserContext } from '../utils/CurrentUserContext';
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
  const {currentUser} = useContext(CurrentUserContext)
  const navigate = useNavigate()
  const data: ObjectData  = useLoaderData() as ObjectData
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
    if(!confirm('Are you sure you want to delete this challenge?')){
      return
    }
    if(!data.object.id){
      throw ('cannot delete without an id')
    }
    console.log('delete', data.object)
    const url = `/api/challenges/delete/${data.object.id}`
    const response = await axios.post(url);
    if(204 === response.status){
      toast.success('Challenge deleted')
      navigate('/challenges')
    } else {
      toast.error('Delete failed')
    }
  }
  const dateOptions:DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  };
  return (
    <>
    <h1>{data.object.name}</h1>
    {data.object.userId === currentUser?.id && (
      <>
        <Link className='underline text-red' to = {`/challenges/edit/${data.object.id}`}>edit</Link>&nbsp;&nbsp;
        <Link className='underline text-red' onClick={handleDelete} to = {`/challenges/edit/${data.object.id}`}>delete</Link>&nbsp;&nbsp;
      </>
    )}
    <div className={`max-w-sm border-2 border-${colorToClassName(data.object.color)} rounded-md p-4`}>
      <div className="mb-2 flex justify-center">
        {data.object.coverPhoto && <img src={data.object.coverPhoto} alt={`${data.object.name} cover photo`} className="max-w-full max-h-40 rounded-sm" />}
      </div>
      <div className="mb-2">
        {new Date(data.object.startAt).toLocaleDateString(undefined, dateOptions)} to {new Date(data.object.endAt).toLocaleDateString(undefined, dateOptions)}
      </div>
      <div className="mb-2">
        Meets <span className="capitalize">{data.object.frequency.toLowerCase()}</span> 
      </div>
      
      <div className="mb-2">
        {data.object.description}
      </div>
    </div>
</>
  );
}