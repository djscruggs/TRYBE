import MyChallenges from '~/components/myChallenges'
import ChallengeList from '~/components/challengeList'
import { useNavigate } from 'react-router';
import Logo from '~/components/logo'
import { WhatsNew } from '~/components/whatsNew'
import { copyToClipboard } from '~/utils/helpers'
import { useContext, JSX } from 'react'
import { CurrentUserContext } from '~/contexts/CurrentUserContext'

export default function Home (): JSX.Element {
  const navigate = useNavigate()
  const { currentUser } = useContext(CurrentUserContext)
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
  const handleRefer = async (): Promise<void> => {
    const url = 'https://app.jointhetrybe.com'
    await copyToClipboard(url)
  }
  return (

    <div className='max-w-lg'>
      <div className='text-xl text-left w-full pl-40 mt-4 md:mt-10 text-red font-light'>WELCOME TO</div>
      <div className='text-8xl font-bold text-center w-full font-cursive text-red'>Trybe</div>
      <div className='text-xl text-right w-full mb-0 md:mb-2 pr-40 text-red font-light'>(BETA)</div>
      <div className='flex flex-col justify-center items-center w-full'>
          <Logo size='36px' backgroundColor='white' />
          <button className='bg-blue text-white text-md rounded-full p-1 px-2 mt-2 w-28 shadow-lg shadow-gray-400' onClick={() => { navigate('/landing') }}>About Us</button>
          <div className='underline text-red cursor-pointer mt-4 mb-0' onClick={handleRefer}>Refer a Friend</div>
      </div>
      <WhatsNew />
      <div className='text-2xl text-center w-full mt-2 text-red font-bold mb-2'>How&apos;s Your Experience?</div>
      <div className='text-center text-sm text-gray-500 mb-2 px-4'>
        Trybe is in BETA mode so there&apos;s plenty of room for improvement.
        We want to know what to fix, what to add, what to delete, what fonts are giving you the ick,
        what spelling mistakes you&apos;ve found and everything in between.
      </div>

      <div className='text-center text-md md:text-lg  underline cursor-pointer italic text-blue' onClick={openFeedback}>Leave Us Your Feedback!</div>
      <div className='w-sm p-2 flex justify-center items-center mt-2'>
        {currentUser ? (
          <MyChallenges range='active' scrollToBrowse={() => { navigate('/challenges') }} centered={true}/>
        ) : (
          <div className='text-center'>
            <div className='text-xl font-bold text-red mb-4'>Explore Challenges</div>
            <ChallengeList challenges={[]} memberships={[]} isLoading={false}/>
            <div className='mt-4'>
              <button 
                className='bg-blue text-white text-md rounded-full p-2 px-4 shadow-lg shadow-gray-400'
                onClick={() => { navigate('/login') }}
              >
                Sign In to Join Challenges
              </button>
            </div>
          </div>
        )}
      </div>
    </div>

  )
}
