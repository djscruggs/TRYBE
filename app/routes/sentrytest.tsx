import { JSX } from 'react'
import { type LoaderFunction, type LoaderFunctionArgs } from 'react-router';
import * as Sentry from '@sentry/remix'

export const loader: LoaderFunction = async (args: LoaderFunctionArgs) => {
  try {
    throw new Error('loader error test of Sentry')
  } catch (error) {
    Sentry.captureException(error)
  }
  return null
}
export default function SentryTest (): JSX.Element {
  try {
    throw new Error('client side error for Stenry test with caught exception')
  } catch (error) {
    Sentry.captureException(error)
  }
  throw new Error('uncaught client side error test of Sentry')

  return <div>sentrytest</div>
}
