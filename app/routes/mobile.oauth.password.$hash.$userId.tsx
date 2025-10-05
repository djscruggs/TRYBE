import { useState, useEffect } from 'react'
import {
  type ActionFunction,
  json,
  type LoaderFunction,
  type LoaderFunctionArgs,
  redirect,
} from 'react-router';
import { Form, Link, useActionData, useNavigate } from 'react-router';
import { createClerkClient } from '@clerk/backend'
import { validatePassword } from '~/models/validators.server'
import * as React from 'react'
import { FormField } from '~/components/formField'
import { Button } from '@material-tailwind/react'
import { useDeviceContext } from '~/contexts/DeviceContext'
import bcrypt from 'bcryptjs'
import { prisma } from '~/models/prisma.server'
import { updatePassword } from '~/models/auth.server'

async function validateUserAndToken (userId: string, hash: string): Promise<{ email: string, userId: string } | null> {
  if (!userId || !hash) {
    return null
  }
  const user = await prisma.user.findUnique({
    where: { id: Number(userId) }
  })
  if (!user) {
    return null
  }
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000)
  // delete anything older than 30 minutes
  await prisma.passwordResetToken.deleteMany({
    where: {
      expiresAt: {
        lt: thirtyMinutesAgo
      }
    }
  })
  const tokenRecord = await prisma.passwordResetToken.findFirst({
    where: {
      userId: Number(userId),
      token: hash,
      expiresAt: {
        gte: thirtyMinutesAgo
      }
    }
  })
  if (!tokenRecord) {
    return null
  }
  return { email: user.email, userId: user.id.toString() }
}

export async function loader (args: LoaderFunctionArgs): Promise<{ params: { email: string, userId: string } } | Response> {
  const validationResult = await validateUserAndToken(args.params.userId ?? '', args.params.hash ?? '')
  if (!validationResult) {
    return redirect('/mobile/login')
  }
  return { params: validationResult }
}

export const action: ActionFunction = async ({ request, params }) => {
  const userId = params.userId ?? ''
  const hash = params.hash ?? ''
  const validationResult = await validateUserAndToken(userId, hash)
  if (!validationResult) {
    return redirect('/mobile/login')
  }
  const form = await request.formData()

  const password = form.get('password')?.toString() ?? ''
  const passwordMatch = form.get('passwordMatch')?.toString() ?? ''
  const errors = {
    password: validatePassword(password, passwordMatch)
  }
  if (Object.values(errors).some(Boolean)) {
    return json({ errors, fields: { password, passwordMatch }, form: action }, { status: 400 })
  }
  // load the user, test password with clerk if necessary
  const user = await prisma.user.findUnique({
    where: { id: Number(userId) }
  })
  if (!user) {
    return redirect('/mobile/login')
  }
  if (user.clerkId) {
    const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })
    try {
      const result = await clerkClient.users.updateUser(user.clerkId, {
        password
      })
      if (result) {
        await updatePassword(userId, password)
        return redirect('/mobile/login?passwordUpdated=true')
      }
    } catch (error: any) {
      console.error(error.errors)
      return json({ error: error.errors[0].longMessage || 'Failed to update password' }, { status: 500 })
    }
  }
}

export default function OauthPassword (): JSX.Element {
  const actionData = useActionData<typeof action>()
  const [formData, setFormData] = useState({
    password: actionData?.fields?.password ?? '',
    passwordMatch: actionData?.fields?.passwordMatch ?? '',
    hashedEmail: actionData?.params?.hash ?? '',
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
      <div className="relative p-2 rounded-md mb-4 w-96 text-center">
        You previously signed in with a third party provider. Please update your password to continue.
      </div>
      {isMobile() &&
        <Form
          method="post"
          className="rounded-2xl bg-gray-200 p-6 w-96"
        >
            <>
              <div className="text-xs font-semibold text-center tracking-wide text-red w-full">
                {actionData?.error}
              </div>
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
                <input type="hidden" name="hashedEmail" value={formData.hashedEmail} />
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
