
import ChallengeForm from '~/components/form-challenge';
import { requireCurrentUser, } from "../utils/auth.server"
import { LoaderFunction } from "@remix-run/node"; 
import { useActionData } from "@remix-run/react";
import { CurrentUserContext } from '../utils/CurrentUserContext'
import { useContext } from 'react';


export const loader: LoaderFunction = async ({ request }) => {
  // if thecurrentUser isn't authenticated, this will redirect to login
  return await requireCurrentUser(request)
}

export default function NewChallenge() {
  const data = useActionData() || {}
  const {currentUser} = useContext(CurrentUserContext)
  const formData = data?.formData || {userId: currentUser?.id}
  const errors = data?.errors || {} 
  return (
    <ChallengeForm object={formData} errors={errors} />
  );
}