

import { requireCurrentUser } from "../utils/auth.server"
import { LoaderFunction } from '@remix-run/node'
import { useLoaderData, Link, Outlet } from '@remix-run/react';
import { fetchChallenges } from "~/utils/challenge.server";
import { json } from "@remix-run/node";
import { Button } from "@material-tailwind/react";
import { useNavigate } from "@remix-run/react";

export const loader: LoaderFunction = async ({ request, params }) => {
  const currentUser = await requireCurrentUser(request)
  const result = await fetchChallenges(currentUser?.id)
  if(!result){
    const error = {loadingError: 'Unable to load challenges'}
    return json(error)
  }
  return json(result)
}

 

export default function ChallengesIndex() {
  const navigate = useNavigate()
  const data:any  = useLoaderData()
  if(data?.loadingError){
    return <h1>{data.loadingError}</h1>
  }
  if(!data){
    return <p>Loading...</p>
  }
  return  (
          <>
            <h1>
              Challenges
            </h1>
            <Button placeholder='New Challenge' onClick={()=>navigate('./new')} className="bg-red">New Challenge</Button>
            
            {(data && data.length) > 0 &&
               data.map((challenge:any)=> (
                <p key={challenge.id}>
                  <Link className='underline text-red' to = {`/challenges/edit/${challenge.id}`}>edit</Link>&nbsp;&nbsp;
                  <Link className='underline text-red' to = {`/challenges/${challenge.id}`}>{challenge.name}</Link>
                </p>
              ))
            }
          </>
          )
}