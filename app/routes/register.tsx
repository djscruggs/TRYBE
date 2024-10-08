import { useState } from 'react'
import { type ActionFunction, json, type LoaderFunction, redirect } from '@remix-run/node'
import { Form, Link, useActionData } from '@remix-run/react'
import { register, requireCurrentUser } from '~/models/auth.server'
import { validateEmail, validateName, validatePassword } from '~/models/validators.server'
import * as React from 'react'
import { FormField } from '~/components/formField'
import { Button } from '@material-tailwind/react'

export const loader: LoaderFunction = async (args) => {
  // If there's already acurrentUser in the session, redirect to the home page
  return (await requireCurrentUser(args)) ? redirect('/challenges') : null
}
export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData()
  const email = form.get('email')?.toString().trim() || ''
  const password = form.get('password')?.toString() || ''
  const passwordMatch = form.get('passwordMatch')?.toString() || ''
  const firstName = form.get('firstName')?.toString().trim() || ''
  const lastName = form.get('lastName')?.toString().trim() || ''
  const errors = {
    email: validateEmail(email),
    firstName: validateName((firstName) || ''),
    lastName: validateName((lastName) || ''),
    password: validatePassword(password, passwordMatch)
  }
  if (Object.values(errors).some(Boolean)) {
    return json({ errors, fields: { email, password, passwordMatch, firstName, lastName }, form: action }, { status: 400 })
  }
  return await register({ email, password, firstName, lastName })
}

export default function Register (): JSX.Element {
  const actionData = useActionData()
  const [formData, setFormData] = useState({
    email: actionData?.fields?.email || '',
    password: actionData?.fields?.password || '',
    firstName: actionData?.fields?.firstName || '', // Corrected
    lastName: actionData?.fields?.lastName || '', // Corrected
    passwordMatch: actionData?.fields?.passwordMatch || ''
  })
  const [passwordVisible, setPasswordVisible] = useState(false)

  // Updates the form data when an input changes
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>, field: string) => {
    setFormData(form => ({ ...form, [field]: event.target.value }))
  }

  return (
    <div className="h-full justify-center items-center flex flex-col gap-y-4">

        <h2 className="text-5xl font-extrabold text-yellow-300">Welcome to Trybe!</h2>

        <Form
          method="post"
          className="rounded-2xl bg-gray-200 p-6 w-96"

        >
          <div className="text-xs font-semibold text-center tracking-wide text-red w-full">
            {actionData?.error}
          </div>

          <FormField
            name="firstName"
            label="First Name"
            onChange={e => { handleInputChange(e, 'firstName') }}
            error={actionData?.errors?.firstName}
            value={formData.firstName}
            autoComplete="given-name"
            autoFocus={true}
          />
          <FormField
            name="lastName"
            label="Last Name"
            error={actionData?.errors?.lastName}
            onChange={e => { handleInputChange(e, 'lastName') }}
            value={formData.lastName}
            autoComplete="family-name"
          />
          <FormField
            name="email"
            label="Email"
            value={formData.email}
            error={actionData?.errors?.email}
            onChange={e => { handleInputChange(e, 'email') }}
            autoComplete="email"
          />
          <div className="relative">
            <FormField
              name="password"
              label="Password"
              value={formData.password}
              onChange={e => { handleInputChange(e, 'password') }}
              type="password"
              autoComplete="new-password"
            />
            {actionData?.errors?.password &&
              <div className="text-xs font-semibold text-left tracking-wide text-red w-full mb-4">
                {actionData?.errors?.password || ''}
              </div>
            }

          </div>
          <div className="relative">
            <FormField
              name="passwordMatch"
              label="Repeat password"
              value={formData.passwordMatch}
              onChange={e => { handleInputChange(e, 'passwordMatch') }}
              type="password"
              autoComplete="new-password"
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
