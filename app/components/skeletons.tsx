// Loading animation
const shimmer =
  'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent'

export function InputSkeleton (): JSX.Element {
  return (
      <div className="flex flex-col gap-4 w-full mb-4">
        <div className="flex gap-4 items-center w-full">
          <div className="flex flex-col gap-4 w-full">
            <div className="skeleton h-6 w-28 bg-gray-lightest dark:bg-gray-70 rounded-md"> </div>
            <div className="skeleton h-12 w-full bg-gray-lightest dark:bg-gray-dark rounded-md"> </div>
          </div>
        </div>
      </div>
  )
}
export const ChatRowSkeleton = ({ count }: { count: number }): JSX.Element => {
  if (count === 0) {
    return <></>
  }

  const skeletons = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className={`relative overflow-hidden rounded-xl bg-grey opacity-10 p-2 h-10 mb-2 shadow-sm ${shimmer}`}
    ></div>
  ))

  return (
    <>
      {skeletons}
    </>
  )
}
export function SingleInputSkeleton (): JSX.Element {
  return (<div className="skeleton h-10 w-full bg-gray-lightest dark:bg-gray-70 rounded-md"></div>)
}
interface FormSkeletonProps {
  numInputs?: number
  className?: string
}

export const FormSkeleton: React.FC<FormSkeletonProps> = ({ numInputs = 3, className = '' }: FormSkeletonProps) => {
  const inputSkeletons = []

  for (let i = 0; i < numInputs; i++) {
    inputSkeletons.push(<InputSkeleton key={i} />)
  }

  return (
    <div className={`pt-8 ${className}`}>
      {inputSkeletons}
    </div>
  )
}
export function CardSkeleton (): JSX.Element {
  return (
    <div
      className={`${shimmer} relative overflow-hidden rounded-xl bg-gray-lightest dark:bg-gray-70 p-2 shadow-sm`}
    >
      <div className="flex p-4">
        <div className="h-5 w-5 rounded-md bg-gray-lighter" />
        <div className="ml-2 h-6 w-16 rounded-md bg-gray-lighter text-sm font-medium" />
      </div>
      <div className="flex items-center justify-center truncate rounded-xl bg-white px-4 py-8">
        <div className="h-7 w-20 rounded-md bg-gray-lighter" />
      </div>
    </div>
  )
}

export function CardsSkeleton ({ count }: { count: number }): JSX.Element {
  const cards = []
  for (let i = 0; i < count; i++) {
    cards.push(<CardSkeleton key={i} />)
  }
  return (
    <>
      {cards}
    </>
  )
}

export function RowSkeleton (): JSX.Element {
  return (
    <div className="flex flex-row items-center justify-between border-b bg-gray-lightest dark:bg-gray-dark border-white dark:border-gray-darker rounded-md m-2 py-4">

    </div>
  )
}
interface TableSkeletonProps {
  numRows?: number
}
export const TableSkeleton: React.FC<TableSkeletonProps> = ({ numRows = 20 }: TableSkeletonProps) => {
  const rowSkeletons = Array.from({ length: numRows }, (_, i) => <RowSkeleton key={i} />)
  return (
    <div className={`${shimmer} relative flex w-full flex-col overflow-hidden md:col-span-4 lg:col-span-4 dark:bg-gray-darkest `}>
      <div className="mb-4 h-8 w-36 rounded-md bg-gray-lightest dark:bg-gray-darkest" />
      <div className="flex grow flex-col justify-between rounded-xl bg-gray-lightest dark:bg-gray-darkest p-4">
        <div className="bg-white dark:bg-gray-dark">
        {rowSkeletons}

        </div>
      </div>
    </div>
  )
}
interface RowsSkeletonProps {
  numRows?: number
}
export const RowsSkeleton: React.FC<RowsSkeletonProps> = ({ numRows = 3 }: RowsSkeletonProps) => {
  const rowSkeletons = []
  for (let i = 0; i < numRows; i++) {
    rowSkeletons.push(<RowSkeleton key={i} />)
  }
  return (
    <div className="bg-white dark:bg-gray-darkest">
      {rowSkeletons}
    </div>
  )
}
