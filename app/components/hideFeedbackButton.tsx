/* this hides the sentry feedback button that shows up globally */
export default function HideFeedbackButton (): JSX.Element {
  return (
    <style>
        {`
          #sentry-feedback {
            display: none;
          }
        `}
    </style>
  )
}
