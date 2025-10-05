import { FaChevronCircleLeft } from 'react-icons/fa'
import { useNavigate } from 'react-router';
export default function MobileBackButton ({ to }: { to?: string }): JSX.Element {
  const navigate = useNavigate()
  const goTo = (): void => {
    if (to) {
      navigate(to)
    } else {
      navigate(-1)
    }
  }
  return (
    <div className='flex items-center md:hidden justify-center w-full my-1'>
      <FaChevronCircleLeft
        className='w-6 h-6 text-grey cursor-pointer mt-4'
        onClick={goTo}
      />
    </div>
  )
}
