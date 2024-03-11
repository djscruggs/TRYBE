
import { requireCurrentUser } from "../models/auth.server"
import { LoaderFunction } from '@remix-run/node'
import { CurrentUserContext } from '../utils/CurrentUserContext';
import { loadUserCreatedChallenges } from "~/models/challenge.server";
import { useLoaderData, Link, Outlet } from '@remix-run/react'
import { useContext } from "react";
import { json } from "@remix-run/node";
export const loader: LoaderFunction = async ({ request, params }) => {
  const currentUser = await requireCurrentUser(request)
  const result = await loadUserCreatedChallenges(currentUser?.id)
  if(!result){
    const error = {loadingError: 'Unable to load challenges'}
    return json(error)
  }
  return json(result)
}


export default function Profile({ children }: { children: React.ReactNode }) {
  const {currentUser} = useContext(CurrentUserContext)
  const {data, error} = useLoaderData<[] | {loadingError: string}>(loader)
  return  (
            <>
              <h1>
                I am Profile
              </h1>

            </>
          )
  }