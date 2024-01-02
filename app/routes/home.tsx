
import { UserContext } from '../src/utils/usercontext';
import { useContext } from 'react';
export default function Home() {
   const user = useContext(UserContext)
   if(!user) {return 'Loading...'}
   return (
      <>
            <h1>Hello, {user.profile.firstName}</h1>
      </>
   );
}