
import { useState } from 'react';
import { ActionFunction, json, LoaderFunction, redirect } from '@remix-run/node'
import { Form, Link } from "@remix-run/react";
import {register, getUser } from '~/src/utils/auth.server'
import { validateEmail, validateName, validatePassword } from '~/src/utils/validators.server'
import { useActionData } from '@remix-run/react'
import * as React from 'react';
import { FormField } from '~/src/components/form-field';
import { Button } from "@material-tailwind/react";


export const loader: LoaderFunction = async ({ request }) => {
  // If there's already a user in the session, redirect to the home page
  return (await getUser(request)) ? redirect('/') : null
}
export const action: ActionFunction = async ({ request }) => {
  
  const form = await request.formData()
  const email = String.prototype.trim(form.get('email') as string)
  const password = form.get('password')
  const passwordMatch = form.get('passwordMatch')
  const firstName = String.prototype.trim(form.get('firstName') as string)
  const lastName = String.prototype.trim(form.get('lastName') as string)
  const errors = {
    email: validateEmail(email),  
    firstName: validateName((firstName as string) || ''),
    lastName: validateName((lastName as string) || ''),
    password: validatePassword(password, passwordMatch)
  }
  if (Object.values(errors).some(Boolean)) {
    return json({ errors, fields: { email, password, passwordMatch, firstName, lastName }, form: action }, { status: 400 })
  }
  return await register({ email, password, firstName, lastName })
}

export default function Register(): JSX.Element {
  const actionData = useActionData()
  
  
  const [formData, setFormData] = useState({
    email: actionData?.fields?.email || '',
    password: actionData?.fields?.password || '',
    firstName: actionData?.fields?.lastName || '',
    lastName: actionData?.fields?.firstName || '',
    passwordMatch:  actionData?.fields?.passwordMatch || '',
  })
  const [passwordVisible, setPasswordVisible] = useState(false)
  
  // Updates the form data when an input changes
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>, field: string) => {
    setFormData(form => ({ ...form, [field]: event.target.value }))
  }
  

  
  
  return (
    <div className="h-full justify-center items-center flex flex-col gap-y-4">
      
        <h2 className="text-5xl font-extrabold text-yellow-300">Welcome to Trybe!</h2>
        <p className="font-semibold text-slate-300">Please Log In!</p>
        
        
        <Form  method="post" className="rounded-2xl bg-gray-200 p-6 w-96">
          <div className="text-xs font-semibold text-center tracking-wide text-red w-full">
            {actionData?.error}
          </div>
          
          <FormField
            htmlFor="firstName"
            label="First Name"
            onChange={e => handleInputChange(e, 'firstName')}
            error={actionData?.errors?.firstName}
            value={formData.firstName}
          />
          <FormField
            htmlFor="lastName"
            label="Last Name"
            error={actionData?.errors?.lastName}
            onChange={e => handleInputChange(e, 'lastName')}
            value={formData.lastName}
          />
          <FormField
            htmlFor="email"
            label="Email"
            value={formData.email}
            error={actionData?.errors?.email}
            onChange={e => handleInputChange(e, 'email')}
          />
          <div className="relative">
            <FormField
              htmlFor="password"
              label="Password"
              value={formData.password}
              onChange={e => handleInputChange(e, 'password')}
              type="password"
            />
            {actionData?.errors?.password &&
              <div className="text-xs font-semibold text-left tracking-wide text-red w-full mb-4">
                {actionData?.errors?.password || ''}
              </div>
            }
            
          </div>
          <div className="relative">
            <FormField
              htmlFor="password_match"
              label="Repeat password"
              value={formData.passwordMatch}
              onChange={e => handleInputChange(e, 'passwordMatch')}
              type="password"
            />
            
            {actionData?.errors?.passwordMatch &&
              <div className="text-xs font-semibold text-left tracking-wide text-red w-full mb-4">
                {actionData?.errors?.passwordMatch || ''}
              </div>
            }
          </div>
          
         
          
          
          <Button
            type="submit"
            className='bg-red'
          >
            Sign Up
          </Button>
           
        </Form>
        <div className="relative">
          Already have an account? <Link to="/login" state={{ animate: false }} className="underline text-blue">Login </Link>
        </div>
      </div>
  )
}