import { useDeviceContext } from '~/contexts/DeviceContext'
import type { LoaderFunctionArgs, LoaderFunction, ActionFunction } from '@remix-run/node'
import { Link, useNavigate, Form, useActionData } from '@remix-run/react'
import { useEffect, useState } from 'react'
import { login } from '~/models/auth.server'
import { FormField } from '~/components/formField'
import { Button } from '@material-tailwind/react'

export const loader: LoaderFunction = async ({ params }: LoaderFunctionArgs) => {
  return { params }
}

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData()
  const email = form.get('email')?.toString().trim() ?? ''
  const password = form.get('password')?.toString() ?? ''
  return await login({ email, password, request })
}
export default function SignInPage (): JSX.Element {
  const actionData = useActionData<typeof action>()
  const [formData, setFormData] = useState({
    email: actionData?.fields?.email ?? '',
    password: actionData?.fields?.password ?? '',
    redirectTo: localStorage.getItem('redirectTo') ?? ''
  })
  const { isMobile } = useDeviceContext()
  const navigate = useNavigate()
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>, field: string) => {
    setFormData(form => ({ ...form, [field]: event.target.value }))
  }
  useEffect(() => {
    if (!isMobile()) {
      navigate('/login')
    }
  }, [])

  return (
    <div className="max-w-sm justify-center items-center mt-10">
      {isMobile() && (
          <Form method="post" className="rounded-2xl bg-gray-200 p-6 w-96">
            <div className="relative">
              <FormField
                type="email"
                name="email"
                label="Email"
                autoComplete="email"
                value={formData.email}
                onChange={e => { handleInputChange(e as React.ChangeEvent<HTMLInputElement>, 'email') }}
              />
            </div>
            <div className="relative">
              <FormField
                type="password"
                name="password"
                label="Password"
                value={formData.password}
                autoComplete="password"
                onChange={e => { handleInputChange(e as React.ChangeEvent<HTMLInputElement>, 'password') }}
              />
            </div>
            <div className="w-full text-center mt-2">
                <Button type="submit" className='bg-red'>Sign In</Button>
            </div>
            <div className="relative text-center mt-2">
              Don&apos;t have an account? <Link className="underline text-blue cursor-pointer" to="/mobile/signup">Sign Up</Link>
            </div>
        </Form>
      )}

    </div>
  )
}
