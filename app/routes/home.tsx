
import { CurrentUserContext } from '../src/utils/CurrentUserContext';
import Nav from '../src/ui/nav'
import { useContext } from 'react';
import UserAvatar from '../src/components/useravatar'
import RandomAvatar from '../src/components/randomavatar'
import FeedChallengeCard from '../src/components/feedchallengecard'
import FeedCommunityCard from '~/src/components/feedcommunitycard';
import FeedPostCard from '~/src/components/feedpostcard';
import {useMobileSize} from '../src/utils/useMobileSize'
import { requireCurrentUser } from "../src/utils/auth.server"
import { LoaderFunction } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react';

export const loader: LoaderFunction = async ({ request }) => {
  // if thecurrentUser isn't authenticated, this will redirect to login
  return await requireCurrentUser(request)
}

export default function Home() {
   const data = useLoaderData<typeof loader>();
   const {currentUser, setCurrentUser} = useContext(CurrentUserContext)
   setCurrentUser(data)
   const isMobile = useMobileSize()
   
   return (
      <> 
            <div className='max-w-lg px-2'>
               <div className="flex items-center pl-0 mt-10 max-w-lg">
                  <div className="flex-grow-0 justify-self-start">
                     <UserAvatar size={isMobile ? 'md': 'xxl'} />
                  </div>
                  <div className={`ml-${isMobile ? 4 : 10} flex-grow text-${isMobile ? 'l' : '4xl'}`}>
                     <h1>Hello, {currentUser?.profile.firstName}</h1>
                  </div>
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