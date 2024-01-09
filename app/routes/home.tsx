
import { UserContext } from '../src/utils/usercontext';
import Nav from '../src/ui/nav'
import { useContext } from 'react';
import UserAvatar from '../src/components/useravatar'
import RandomAvatar from '../src/components/randomavatar'
import FeedChallengeCard from '../src/components/feedchallengecard'
import FeedCommunityCard from '~/src/components/feedcommunitycard';
import FeedPostCard from '~/src/components/feedpostcard';

export default function Home() {
   const user = useContext(UserContext)
   if(!user) {return 'Loading...'}
   return (
      <> 
            <div className='max-w-lg px-2'>
               <div className="flex items-center pl-0 mt-10 max-w-lg">
                  <div className="flex-grow-0 justify-self-start">
                     <UserAvatar size='xxl' />
                  </div>
                  <div className="ml-10 flex-grow text-4xl">
                     <h1>Hello, {user.profile.firstName}</h1>
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