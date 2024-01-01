import type { LoaderFunctionArgs } from "@remix-run/node"; // or cloudflare/deno
import { json } from "@remix-run/node"; // or cloudflare/deno
import {getUser} from '../src/utils/auth.server'

export const loader = async ({
  request,
}: LoaderFunctionArgs) => {
  // handle "GET" request
  return getUser(request)
  .then((response) => {
    return response
  }).then((data) => {
    console.log('returning data now')
    console.log(data); // this will be a string
    return data
  });
  
};
