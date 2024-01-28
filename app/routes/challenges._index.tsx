

import { requireCurrentUser } from "../utils/auth.server"
import { LoaderFunction } from '@remix-run/node'
import { useLoaderData, Link, Outlet } from '@remix-run/react';
import { CurrentUserContext } from '../utils/CurrentUserContext';
import { useContext, useEffect } from "react";
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getUserSession, storage } from "../utils/auth.server";

export const loader: LoaderFunction = async ({ request }) => {
  // if thecurrentUser isn't authenticated, this will redirect to login
  return await requireCurrentUser(request)
}

export default function ChallengesIndex({ children }: { children: React.ReactNode }) {
  return  (
          <>
            <h1>
              I am Challenges _index
            </h1>
          </>
          )
  }