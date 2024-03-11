import type { LoaderFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node' // or cloudflare/deno
import { requireCurrentUser } from '../models/auth.server'

export const loader = async ({
  request
}: LoaderFunctionArgs) => {
  // handle "GET" request
  return await requireCurrentUser(request)
    .then((response) => {
      return response
    }).then((data) => {
      return data
    })
}
