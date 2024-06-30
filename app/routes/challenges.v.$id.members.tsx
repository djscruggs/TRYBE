import { useLoaderData, json } from '@remix-run/react'
import { type LoaderFunction } from '@remix-run/server-runtime'
import { fetchChallengeMembers } from '~/models/challenge.server'
import AvatarLoader from '~/components/avatarLoader'
export const loader: LoaderFunction = async ({ request, params }) => {
  if (!params.id) {
    return json({ loadingError: 'Challenge id not included' })
  }
  const result = await fetchChallengeMembers(params.id)

  if (!result) {
    const error = { loadingError: 'Challenge not found' }
    return json(error)
  }
  const data: Array<Record<string, any>> = result
  return json(data)
}
export default function ViewChallengeMembers (): JSX.Element {
  const members = useLoaderData<typeof loader>()
  return (
    <>

    <div className="mt-8">
      <p>Members</p>
      {members.map((member) => {
        return (
          <div key={member.id} className='max-w-sm'>
            <div className='mb-2 p-4 border border-gray-200 break-all rounded-md even:bg-white odd:bg-gray-50'>
              <AvatarLoader object={member} marginClass='mr-4' clickable={true}/>
              {member.user.profile?.firstName} {member.user.profile?.lastName}
            </div>

          </div>
        )
      })}
    </div>
    </>

  )
}
