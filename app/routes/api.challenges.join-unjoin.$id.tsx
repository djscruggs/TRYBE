
import {joinChallenge, unjoinChallenge, challengeSchema} from '~/utils/challenge.server'
import { requireCurrentUser, getUser } from "~/utils/auth.server"
import { json, LoaderFunction } from "@remix-run/node"; 
import type { ActionFunctionArgs} from "@remix-run/node"; // or cloudflare/deno

export async function action({
  request, params
}: ActionFunctionArgs) {
    requireCurrentUser(request)
    const user = await getUser(request, true)
    if(!user){
      return {
        result: 'not-logged-in',
      }
    }
    console.log(params.id, user)
    if(user.memberChallenges.filter((c) => c.challengeId === parseInt(params.id as string)).length > 0){
      const result = await unjoinChallenge(user.id, Number(params.id))
      return {
        result: 'unjoined',
        data: result
      }
    } else {
      const result = await joinChallenge(user.id, Number(params.id))
      return {
        result: 'joined',
        data: result
      }
    }
  
    return {
      result: 'joined',
    }
}
export const loader: LoaderFunction = async ({ request }) => {
  const currentUser = await requireCurrentUser(request)
  return json({ message: 'This route does not accept GET requests' }, 200);
}