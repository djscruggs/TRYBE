export default function DateDivider ({ date }: { date: string }): JSX.Element {
  return (
    <div className='border-t border-teal flex items-center justify-center'>
      <div className="text-center p-1 -mt-3.5 rounded-md drop-shadow-xl w-[90px] bg-teal text-xs text-white">{date}</div>
    </div>
  )
}
