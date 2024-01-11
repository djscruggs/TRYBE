import { LoaderFunction, redirect } from '@remix-run/node'
import type { ActionFunctionArgs } from "@remix-run/node";
import { logout } from '~/src/utils/auth.server'

export async function action({ request }: ActionFunctionArgs) {
  return logout(request);
}

export const loader: LoaderFunction = async ({ request }) => {
  return redirect("/");
}