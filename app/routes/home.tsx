
import { CurrentUserContext } from '../utils/CurrentUserContext';
import { useContext } from 'react';
import UserAvatar from '../components/useravatar'
import RandomAvatar from '../components/randomavatar'

import FeedCommunityCard from '~/components/feedcommunitycard';
import FeedPostCard from '~/components/feedpostcard';
import {useMobileSize} from '../utils/useMobileSize'
import { requireCurrentUser } from "../utils/auth.server"
import { LoaderFunction } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react';
import FeedChallengeCard from '~/components/feedchallengecard';

export const loader: LoaderFunction = async ({ request }) => {
  // if currentUser isn't authenticated, this will redirect to login
  return await requireCurrentUser(request)
}

export default function Home() {
   const {currentUser} = useContext(CurrentUserContext)
   const isMobile = useMobileSize()
   
   return (
      <> 
            <div className='max-w-lg px-2'>
               <div className="flex items-center pl-0 mt-10 max-w-lg">
                  <div className="flex-grow-0 justify-self-start">
                     <UserAvatar size={isMobile ? 'md': 'xxl'} />
                  </div>
                  {currentUser?.profile &&
                  <div className={`ml-4 flex-grow text-${isMobile ? 'l' : '4xl'}`}>
                     <h1>Hello, {currentUser.profile.firstName}</h1>
                  </div>
                  }
                  </div>
                  <div className="flex items-center justify-between w-full max-w-lg mt-10">
                  <div className="flex-grow-0">
                     <h2 className="flex-grow-0">Updates</h2>
                  </div>
                  <div className="flex-grow-0">
                     <select>
                        <option>Filter</option>
                        <option>Challenges</option>
                        <option>Events</option>
                     </select>
                  </div>
               </div>
            </div>
            <div className="flex items-center pl-0 mt-10 max-w-lg">
               <div className="ml-4 flex-grow text-2xl ">
                  <FeedChallengeCard />
               </div>
            </div>
            <div className="flex items-center pl-0 mt-10 max-w-lg">
               <div className="ml-4 flex-grow text-2xl ">
                  <FeedCommunityCard />
               </div>
            </div>
            <div className="flex items-center pl-0 mt-10 max-w-lg">
               <div className="ml-4 flex-grow text-2xl ">
                  <FeedPostCard />
               </div>
            </div>            
      </>
   );
}