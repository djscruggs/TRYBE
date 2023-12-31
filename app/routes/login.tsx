
import { useState } from 'react';
import { ActionFunction, json, LoaderFunction, redirect } from '@remix-run/node'
import { Form } from "@remix-run/react";
import { login, register, getUser } from '~/src/utils/auth.server'
import { validateEmail, validateName, validatePassword } from '~/src/utils/validators.server'
import { useActionData } from '@remix-run/react'
import { useRef, useEffect } from 'react'
import * as React from 'react';
import { FormField } from '~/src/components/form-field';
import { Button } from "@material-tailwind/react";
import ShowPasswordButton from '../src/components/show-password-button';

export const loader: LoaderFunction = async ({ request }) => {
  // If there's already a user in the session, redirect to the home page
  return (await getUser(request)) ? redirect('/') : null
}
export const action: ActionFunction = async ({ request }) => {
  
  const form = await request.formData()
  const action = form.get('_action')
  const email = form.get('email')
  const password = form.get('password')
  let firstName = form.get('firstName')
  let lastName = form.get('lastName')

  

  if (typeof action !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
    return json({ error: `Invalid Form Data`, form: action }, { status: 400 })
  }
  console.log('passed initial')
  if (action === 'register' && (typeof firstName !== 'string' || typeof lastName !== 'string')) {
    return json({ error: `Invalid Form Data`, form: action }, { status: 400 })
  }
  console.log('checking errors')
  const errors = {
    email: validateEmail(email),
    ...(action === 'register'
      ? {
          firstName: validateName((firstName as string) || ''),
          lastName: validateName((lastName as string) || ''),
          password: validatePassword(password)
        }
      : {}),
  }
  
  if (Object.values(errors).some(Boolean)) {
    console.log('returning json')
    return json({ errors, fields: { email, password, firstName, lastName }, form: action }, { status: 400 })
  }
  console.log('checking action', action)
  switch (action) {
    case 'login': {
        return await login({ email, password })
    }
    case 'register': {
        firstName = firstName as string
        lastName = lastName as string
        return await register({ email, password, firstName, lastName })
    }
    default:
        return json({ error: `Invalid Form Data` }, { status: 400 });
  }
    
}
interface LoginProps {
  type: string;
}

export default function Login({ type='login' }: LoginProps): JSX.Element {
  const actionData = useActionData()
  console.log('actionData at top')
  console.log(actionData)
  
  const [_action, setAction] = useState(type)
  
  const firstLoad = useRef(true)
  const [errors, setErrors] = useState(actionData?.errors)
  const [formError, setFormError] = useState(actionData?.error)
  console.log('afer setFormError', formError)
  const [formData, setFormData] = useState({
    email: actionData?.fields?.email || '',
    password: actionData?.fields?.password || '',
    firstName: actionData?.fields?.lastName || '',
    lastName: actionData?.fields?.firstName || '',
    _action: actionData?.fields?._action || type,
  })
  const [passwordVisible, setPasswordVisible] = useState(false)
  
  // Updates the form data when an input changes
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>, field: string) => {
    setFormData(form => ({ ...form, [field]: event.target.value }))
  }
  useEffect(() => {
    if (!firstLoad.current) {
      console.log('resetting')
      const newState = {
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        _action: _action
      }
      setErrors(newState)
      setFormError('')
      setFormData(newState)
    }
  }, [_action])

  useEffect(() => {
    if (!firstLoad.current) {
      console.log('resetting form error')
      setFormError('')
    }
  }, [formData])
  useEffect(() => {
    if (!firstLoad.current) {
      console.log('resetting form error')
      setErrors(actionData.errors)
    }
    setFormError(actionData?.error)
  }, [actionData])

  useEffect(() => { firstLoad.current = false }, [])
 
  function togglePasswordVisibility() {
    setPasswordVisible((prevState) => !prevState);
  }
  console.log('before return, formError')
  console.log(formError)
  return (
    <div className="h-full justify-center items-center flex flex-col gap-y-4">
      
        <h2 className="text-5xl font-extrabold text-yellow-300">Welcome to Trybe!</h2>
        <p className="font-semibold text-slate-300">Please Log In!</p>
        <button
          onClick={() => setAction(_action == 'login' ? 'register' : 'login')}
          className="absolute top-8 right-8 rounded-xl bg-primary px-3 py-2 transition duration-300 ease-in-out hover:bg-yellow-400 hover:-translate-y-1"
        >
          {_action === 'login' ? 'Sign Up' : 'Sign In'}
        </button>
        
        <Form  method="post" className="rounded-2xl bg-gray-200 p-6 w-96">
        <div className="text-xs font-semibold text-center tracking-wide text-red w-full">
                {formError}

            </div>
        {_action === 'register' && (
            <>
              <FormField
                htmlFor="firstName"
                label="First Name"
                onChange={e => handleInputChange(e, 'firstName')}
                error={errors?.firstName}
                value={formData.firstName}
              />
              <FormField
                htmlFor="lastName"
                label="Last Name"
                error={errors?.lastName}
                onChange={e => handleInputChange(e, 'lastName')}
                value={formData.lastName}
              />
            </>
          )}
           <input 
          name="_action"
          type="hidden"
          value={_action} />
          <FormField
            htmlFor="email"
            label="Email"
            value={formData.email}
            error={errors?.email}
            onChange={e => handleInputChange(e, 'email')}
          />
          <div className="relative">
            <label htmlFor='password' className="text-blue-600 font-semibold">Password</label>
            <input
              name="password"
              className="w-full p-2 rounded-xl my-2"
              id="password"
              
              value={formData.password}
              onChange={e => handleInputChange(e, 'password')}
              type={passwordVisible ? "text" : "password"}
            />
            <ShowPasswordButton passwordVisible={passwordVisible} clickHandler={togglePasswordVisibility} />
            <div className="text-xs font-semibold text-center tracking-wide text-red w-full">
                {errors?.password || ''}
            </div>
          </div>
          
         
          
          
          <Button
            
            type="submit"
            className='bg-red'
            value={_action}
            
          >
             
          
            {_action === 'login' ? "Sign In" : "Sign Up"}
          </Button>
        </Form>
      </div>
  )
}