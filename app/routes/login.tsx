
import { useState } from 'react';
import { ActionFunction, json, LoaderFunction, redirect } from '@remix-run/node'
import { Form, Link } from "@remix-run/react";
import { login, requireCurrentUser } from '~/utils/auth.server'
import { validateEmail } from '~/utils/validators.server'
import { useActionData } from '@remix-run/react'
import * as React from 'react';
import { FormField } from '~/components/form-field';
import { Button } from "@material-tailwind/react";

export const loader: LoaderFunction = async ({ request }) => {
  
  // If there's already a currentUser in the session, redirect to the home page
  return (await requireCurrentUser(request)) ? redirect('/home') : null
}
export const action: ActionFunction = async ({ request }) => {
  
  const form = await request.formData()
  const email = form.get('email')
  const password = form.get('password')
  if (typeof typeof email !== 'string' || typeof password !== 'string') {
    return json({ error: `Invalid Form Data`, form: action }, { status: 400 })
  }
  
  const errors = {
    email: validateEmail(email),
  }
  
  if (Object.values(errors).some(Boolean)) {
    return json({ errors, fields: { email }, form: action }, { status: 400 })
  }
  const result = await login({ email, password, request })
  return result
    

}

export default function Login(): JSX.Element {
  const actionData = useActionData()
  const [formData, setFormData] = useState({
    email: actionData?.fields?.email || '',
    password: actionData?.fields?.password || '',
  })
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>, field: string) => {
    setFormData(form => ({ ...form, [field]: event.target.value }))
  }
  return (
    <div className="h-full justify-center items-center flex flex-col gap-y-4">
      
        <h2 className="font-san text-5xl font-extrabold text-yellow-300">Welcome to Trybe!</h2>
        <p className="font-semibold text-slate-300">Please Log In!</p>
        
        
        <Form  method="post" className="rounded-2xl bg-gray-200 p-6 w-96">
        { actionData?.error &&
          <div className="text-xs font-semibold text-center tracking-wide text-red w-full">
            {actionData?.error}
          </div>
        }
        
          <FormField
            htmlFor="email"
            label="Email"
            value={formData.email}
            error={actionData?.errors?.email}
            onChange={e => handleInputChange(e, 'email')}
            autoFocus={true}
          />
          <div className="relative">
            <FormField
              htmlFor="password"
              label="Password"
              value={formData.password}
              onChange={e => handleInputChange(e, 'password')}
              type='password'
            />
            
          </div>
          
         
          
          
          <Button
            type="submit"
            className='bg-red'
            >
            Sign In
          </Button>
        </Form>
        <div className="relative">
          Don't have an account? <Link to="/register" state={{ animate: false }} className="underline text-blue">Register</Link>
        </div>
      </div>
  )
}