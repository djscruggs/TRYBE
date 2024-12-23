export default function Logo ({ size = '24px', backgroundColor = 'white', className = '' }: { size?: string, backgroundColor?: string, className?: string }): JSX.Element {
  return (
        <img src="/logo.png" className={`h-[${size}] bg-${backgroundColor} rounded-full ${className}`} />
  )
}
// this is used to generate tailwind classes
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sizes = {
  24: <span className='h-[24px] w-[24px]'>T</span>,
  36: <span className='h-[36px] w-[36px]'>T</span>,
  40: <span className='h-[40px] w-[40px]'>T</span>,
  48: <span className='h-[48px] w-[48px]'>T</span>,
  60: <span className='h-[60px] w-[60px]'>T</span>,
  80: <span className='h-[80px] w-[80px]'>T</span>,
  100: <span className='h-[100px] w-[100px]'>T</span>,
  120: <span className='h-[120px] w-[120px]'>T</span>,
  140: <span className='h-[140px] w-[140px]'>T</span>,
  160: <span className='h-[160px] w-[160px]'>T</span>,
  180: <span className='h-[180px] w-[180px]'>T</span>,
  200: <span className='h-[200px] w-[200px]'>T</span>
}
