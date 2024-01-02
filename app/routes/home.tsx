
import { UserContext } from '../src/utils/usercontext';
import { useContext } from 'react';
import UserAvatar from '../src/components/useravatar'
import RandomAvatar from '../src/components/randomavatar'
import CardWithLink from '../src/components/cardwithlink'

export default function Home() {
   const user = useContext(UserContext)
   if(!user) {return 'Loading...'}
   return (
      <>
            
            <div className='border-2 border-blue max-w-lg'>
               <div className="flex items-center pl-0 mt-10 max-w-lg border-2 border-red">
                  <div className="flex-grow-0 justify-self-start border-2 border-grey">
                     <UserAvatar size='xxl' />
                  </div>
                  <div className="ml-10 flex-grow text-4xl border-2 border-grey">
                     <h1>Hello, {user.profile.firstName}</h1>
                  </div>
                  </div>
                  <div className="flex items-center justify-between w-full max-w-lg mt-10">
                  <div className="flex-grow-0 border-2 border-grey">
                     <h2 className="flex-grow-0">Updates</h2>
                  </div>
                  <div className="flex-grow-0">
                     <select>
                        <option>Filter</option>
                        {/* Other options */}
                     </select>
                  </div>
               </div>
            </div>
            <div className="flex items-center pl-0 mt-10 max-w-lg">
               <div className="  border-2 border-grey">
                  <RandomAvatar size='xl' />
               </div>
               <div className="ml-4 flex-grow text-2xl ">
                  <CardWithLink />
               </div>
               
            </div>
      </>
   );
}