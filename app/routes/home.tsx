import MyChallenges from '~/components/myChallenges'
import { useNavigate } from '@remix-run/react'
import Logo from '~/components/logo'
import { WhatsNew } from '~/components/whatsNew'
export default function Home (): JSX.Element {
  const navigate = useNavigate()
  const openFeedback = (): void => {
    // Select the shadow host element
    const shadowHost = document.querySelector('#sentry-feedback')
    if (shadowHost) {
      // Access the shadow root
      const shadowRoot = shadowHost.shadowRoot
      if (shadowRoot) {
        // Select the button inside the shadow root
        const feedbackButton = shadowRoot.querySelector('button')
        if (feedbackButton) {
          feedbackButton.click() // Trigger a click event on the button
        }
      }
    }
  }
  return (

    <div className='max-w-lg'>
      <div className='text-xl text-left w-full pl-20 md:pl-40 mt-10 text-red'>WELCOME TO</div>
      <div className='text-8xl font-bold text-center w-full font-cursive text-red'>Trybe</div>
      <div className='text-xl text-right w-full mb-8 md:mb-8 pr-20 md:pr-40 text-red'>(BETA)</div>
      <div className='flex flex-col justify-center items-center w-full mb-4'>
          <Logo size='36px' backgroundColor='white' />
          <button className='bg-blue text-white text-md rounded-full p-1 px-2 mt-8' onClick={() => { navigate('/landing') }}>About Us</button>
      </div>
      <WhatsNew />
      <div className='text-2xl text-left w-full pl-20 md:pl-40 mt-4 text-red font-bold mb-4'>How&apos;s Your Experience?</div>
      <div className='text-center text-sm text-gray-500 mb-4'>
        Trybe is in BETA mode so there&apos;s plenty of room for improvement.
        We want to know what to fix, what to add, what to delete, what fonts are giving you the ick,
        what spelling mistakes you&apos;ve found and everything in between.
      </div>

      <div className='text-center text-lg  underline cursor-pointer italic text-blue' onClick={openFeedback}>Leave Us Your Feedback!</div>
      <MyChallenges range='active' scrollToBrowse={() => { navigate('/challenges') }} />
    </div>

  )
}
