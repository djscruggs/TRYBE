

import { requireCurrentUser } from "../utils/auth.server"
import { LoaderFunction } from '@remix-run/node'
import { useLoaderData, Link, Outlet } from '@remix-run/react';
import { fetchChallengeSummaries } from "~/utils/challenge.server";
import { json } from "@remix-run/node";
import { Button } from "@material-tailwind/react";
import { useNavigate } from "@remix-run/react";
import CardChallenge from "~/components/cardChallenge";
import { CurrentUserContext } from '../utils/CurrentUserContext'
import { useContext } from 'react';

export const loader: LoaderFunction = async ({ request, params }) => {
  const currentUser = await requireCurrentUser(request)
  const result = await fetchChallengeSummaries()
  if(!result){
    const error = {loadingError: 'Unable to load challenges'}
    return json(error)
  }
  return json(result)
}

 

export default function ChallengesIndex() {
  const navigate = useNavigate()
  const data:any  = useLoaderData()
  const {currentUser} = useContext(CurrentUserContext)
  if(data?.loadingError){
    return <h1>{data.loadingError}</h1>
  }
  if(!data){
    return <p>Loading...</p>
  }
  return  (
          <>
            <h1 className="text-3xl font-bold mb-4">
              Challenges
            </h1>
            <div className="max-w-md">
            <p className="text-red">We need a descripton of what a challenge is here</p>
            <Button placeholder='New Challenge' size="sm" onClick={()=>navigate('./new')} className="bg-red mb-4">New</Button>
            
            {(data && data.length) > 0 &&
               data.map((challenge:any)=> (
                <p key={challenge.id}>
                  <CardChallenge challenge={challenge} />                  
                </p>
              ))
            }
            
          </div>
          </>
          )
}