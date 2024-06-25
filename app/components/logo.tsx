export default function Logo ({ size = '24px', backgroundColor = 'white' }: { size: string, backgroundColor: string }): JSX.Element {
  return (
        <img src="/logo.png" className={`h-[${size}] bg-${backgroundColor} rounded-full`} />
  )
}
