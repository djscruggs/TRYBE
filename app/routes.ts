import { loader } from '@remix-run/node';
import {requireCurrentUser} from './src/utils/auth.server'
import { json, redirect } from 'remix';

export default loader(async ({ request }) => {
  // Check thecurrentUser's authentication status
  
  const isAuthenticated = requireCurrentUser(request)
  console.log('isAuthenticated')
  console.log(isAuthenticated)
  // if (!isAuthenticated) {
  //   // Redirect to the login page for protected routes
  //   return redirect('/login');
  // }

  // For open routes, return the route content
  return json({ message: 'This is an open route' });
});