export default function Logo ({ size = '24px', backgroundColor = 'white', className = '' }: { size?: string, backgroundColor?: string, className?: string }): JSX.Element {
  return (
        <img src="/logo.png" className={`h-[${size}] bg-${backgroundColor} rounded-full ${className}`} />
  )
}
