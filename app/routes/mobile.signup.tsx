import { Button } from '~/utils/material-tailwind';
import { useState, useEffect } from 'react'
import { type ActionFunction, type LoaderFunction, type LoaderFunctionArgs  } from 'react-router';
import { Form, Link, useActionData, useNavigate } from 'react-router';
import { register, requireCurrentUser } from '~/models/auth.server'
import { validateEmail, validateName, validatePassword } from '~/models/validators.server'
import * as React from 'react'
import { FormField } from '~/components/formField'
import { useDeviceContext } from '~/contexts/DeviceContext'

export const loader: LoaderFunction = async (args: LoaderFunctionArgs) => {
  // If there's already acurrentUser in the session, redirect to the home page
  await requireCurrentUser(args)
  return { params: args.params }
}

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData()
  const email = form.get('email')?.toString().trim() ?? ''
  const password = form.get('password')?.toString() ?? ''
  const passwordMatch = form.get('passwordMatch')?.toString() ?? ''
  const firstName = form.get('firstName')?.toString().trim() ?? ''
  const lastName = form.get('lastName')?.toString().trim() ?? ''
  const errors = {
    email: validateEmail(email),
    firstName: validateName((firstName) || ''),
    lastName: validateName((lastName) || ''),
    password: validatePassword(password, passwordMatch)
  }
  if (Object.values(errors).some(Boolean)) {
    return { errors, fields: { email, password, passwordMatch, firstName, lastName }, form: action }, { status: 400 }
  }
  return await register({ email, password, firstName, lastName })
}

export default function Register (): JSX.Element {
  const actionData = useActionData<typeof action>()
  const [formData, setFormData] = useState({
    email: actionData?.fields?.email ?? '',
    password: actionData?.fields?.password ?? '',
    firstName: actionData?.fields?.firstName ?? '',
    lastName: actionData?.fields?.lastName ?? '',
    passwordMatch: actionData?.fields?.passwordMatch ?? '',
    redirectTo: localStorage.getItem('redirectTo') ?? ''
  })
  const navigate = useNavigate()
  const { isMobile } = useDeviceContext()
  // this page is only for mobile. if a normal web browser is used, redirect to the signup page
  useEffect(() => {
    if (!isMobile()) {
      navigate('/signup')
    }
  }, [])
  // Updates the form data when an input changes
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>, field: string) => {
    setFormData(form => ({ ...form, [field]: event.target.value }))
  }

  return (
    <div className='max-w-xl justify-center items-center mt-10  w-screen h-screen'>
      {isMobile() &&
        <Form
          method="post"
          className="rounded-2xl bg-gray-200 p-6 w-96"
        >
            <>
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
              <div className="w-full text-center mt-2">
                <Button
                  type="submit"
                  className='bg-red'
                >
                  Sign Up
                </Button>
              </div>

            <div className="relative text-center mt-2">
              Already have an account? <Link className="underline text-blue cursor-pointer" to="/mobile/login">Login</Link>
            </div>
          </>
        </Form>
     }
    </div>
  )
}
