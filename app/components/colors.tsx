// DO NOT USE THIS FUNCTION
// IT'S JUST A HACK TO MAKE SURE TAILWIND GENERATES THE COLORS
export function Colors (): JSX.Element {
  return (
      <div className='hidden'>
        <div className='text-purple-400 bg-purple-400 border-purple-400 ring-purple-400'>purple</div>
        <div className='text-blue-gray-50 bg-blue-gray-50 border-blue-gray-50 ring-blue-gray-50'>blue-gray</div>
        <div className='text-white bg-white border-white ring-white'>white</div>
        <div className='bg-gradient-to-b from-purple-400 to-white ring-purple-400'>gradient</div>
        <div className='text-pink-300 bg-pink-300 border-pink-300 ring-pink-300'>pink</div>
        <div className='bg-gradient-to-b from-pink-300 to-white ring-pink-300'>gradient</div>
        <div className='text-blue-500 bg-blue border-blue ring-blue'>blue</div>
        <div className='bg-gradient-to-b from-blue to-white ring-blue'>gradient</div>
        <div className='text-yellow bg-yellow border-yellow ring-yellow'>yellow</div>
        <div className='bg-gradient-to-b from-yellow to-white'>gradient</div>
        <div className='text-orange-500 bg-orange-500 border-orange-500'>orange</div>
        <div className='bg-gradient-to-b from-orange-500 to-white'>gradient</div>
        <div className='text-red bg-red/04 border-red'>red</div>
        <div className='bg-gradient-to-b from-red to-white'>gradient</div>
        <div className='text-green-500 bg-green-500 border-green-500 ring-green-500'>green</div>
        <div className='bg-gradient-to-b from-green-500 to-white ring-green-500'>gradient</div>
        <div className='text-grey bg-grey border-grey ring-grey'>grey</div>
        <div className='bg-salmon text-salmon ring-salmon border-salmon'>salmon</div>
        <div className='bg-gradient-to-b from-salmon to-white'>gradient</div>
        <div className='bg-gradient-to-b from-grey to-white'>gradient</div>
        <div className='max-w-[300px] bg-gradient-to-b from-grey to-white'>max width 300</div>
        <div className='max-w-[400px] bg-gradient-to-b from-grey to-white'>max width 400</div>
        <div className='w-[40px] h-[40px] bg-yellow'>width 40px</div>
        </div>

  )
}
