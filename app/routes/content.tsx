import { requireCurrentUser } from '~/models/auth.server'
import { type LoaderFunction, json } from '@remix-run/node'
import { useLoaderData, Link, useParams, useNavigate, Outlet } from '@remix-run/react'
import { fetchUserChallenges, fetchUserMemberships } from '~/models/challenge.server'
import { fetchUserNotes } from '~/models/note.server'
import { fetchUserPosts } from '~/models/post.server'
import React, { useState, useContext } from 'react'
// import { bo } from '~/public/icons/icons8-box'
import {
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel
} from '@material-tailwind/react'
import CardChallenge from '~/components/cardChallenge'
import CardChallengeMembership from '~/components/cardChallengeMembership'
import CardPost from '~/components/cardPost'
import CardNote from '~/components/cardNote'
import { CurrentUserContext } from '~/utils/CurrentUserContext'
import { LuStickyNote } from 'react-icons/lu'
import { FaPeopleGroup } from 'react-icons/fa6'
import { FaChartLine } from 'react-icons/fa'
import { BsJournalBookmark } from 'react-icons/bs'

export const loader: LoaderFunction = async (args) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const currentUser = await requireCurrentUser(args)
  const uid = Number(args.params.userId ?? currentUser?.id)
  const challenges = await fetchUserChallenges(uid) as { error?: string }
  const memberships = await fetchUserMemberships(uid) as { error?: string }
  const notes = await fetchUserNotes(uid) as { error?: string }
  const posts = await fetchUserPosts(uid) as { error?: string }
  return json({ challenges, notes, posts, memberships })
}
export default function UserSpecificContent (): JSX.Element {
  const data: any = useLoaderData()
  const { challenges, notes, posts, memberships } = data
  const params = useParams()
  const [selected, setSelected] = useState(params.tab ?? 'memberships')
  const navigate = useNavigate()

  const handleTabChange = (value: string) => {
    setSelected(value)
    navigate(`/content/${value}`)
  }

  if (data?.error) {
    return <h1>{data.error}</h1>
  }
  if (!data) {
    return <p>Loading...</p>
  }
  return (
          <div className="mt-10 w-dvw p-4 md:max-w-xl">
            <h1 className="text-3xl font-bold mb-4">
              My Stuff
            </h1>
            <Tabs value={selected} className='min-w-full'>
              <TabsHeader className='min-w-full' >
                <Tab key='memberships' value='memberships' onClick={() => { handleTabChange('memberships') }}>
                  <div className='text-sm w-max'>
                    <FaPeopleGroup className='text-2xl inline' /> Memberships
                  </div>
                </Tab>
                <Tab key='challenges' value='challenges' className='text-sm' onClick={() => { handleTabChange('challenges') }}>
                  <div className='text-sm w-max'>
                    <FaChartLine className='text-2xl inline' /> Challenges
                  </div>
                </Tab>
                <Tab key='notes' value='notes' className='text-sm' onClick={() => { handleTabChange('notes') }}>
                  <div className='text-sm w-max'>
                    <LuStickyNote className='text-2xl inline' /> Notes
                  </div>
                </Tab>
                <Tab key='posts' value='posts' className='text-sm' onClick={() => { handleTabChange('posts') }}>
                  <div className='text-sm w-max'>
                    <BsJournalBookmark className='text-2xl inline' /> Posts
                  </div>
                </Tab>
              </TabsHeader>
              <TabsBody className='min-w-full' >
                <TabPanel key='memberships' value='memberships' className='flex flex-cols items-center justify-center'>
                  <div className="w-full max-w-md justify-center items center">
                    {(memberships.length) > 0
                      ? <>
                        <h2>Challenges in which you are a member</h2>
                        {memberships.map((membership: any) => (
                          <div key={`${membership.id}-${membership.userId}`}>
                            <CardChallengeMembership membership={membership}/>
                          </div>

                        ))}

                      </>
                      : <p>You are not a member of any challenges. <Link to="/challenges" className="text-blue underline">Browse challenges</Link> and find one to join today!</p>
                    }
                  </div>
                </TabPanel>
                <TabPanel key='challenges' value='challenges' className='flex flex-cols items-center justify-center'>
                  <div className="w-full max-w-md flex flex-col justify-center items-center space-y-4">
                  {challenges.length > 0
                    ? <>
                    <h2>Challenges you personally created</h2>

                    {challenges.map((challenge: any) => (
                        <CardChallenge key={`challenge-${challenge.id}`} challenge={challenge} isMember={challenge.isMember} />
                    ))}

                    </>
                    : <p>You have not created any challenges. <Link to="/challenges/new" className="text-blue underline">Create one now!</Link></p>
                  }

                  </div>
                </TabPanel>
                <TabPanel key='notes' value='notes'>
                  <div className="w-full">

                    {(notes.length) > 0
                      ? <>
                      <h2>Tweet-length comments and shares</h2>
                      {notes.map((note: any) => (
                        <p key={note.id}>
                          <CardNote note={note} />
                        </p>
                      ))}
                      </>
                      : <p>You have not created any notes. Go to the <Link to="/challenges" className="text-blue underline">home page</Link> and create one now!</p>
                  }

                  </div>
                </TabPanel>
                <TabPanel key='posts' value='posts'>
                  <div className="w-full">
                    {(posts.length) > 0
                      ? <>
                        <h2>Longer form posts</h2>
                        <Link to="/posts" className="text-blue underline">Browse posts</Link>

                        {posts.map((post: any) => (
                          <p key={post.id}>
                            <CardPost post={post} />
                          </p>
                        ))}
                      </>
                      : <p>You have not created any posts. <Link to="/posts" className="text-blue underline">Browse posts</Link> or <Link to="/posts/new" className="text-blue underline">create one now!</Link></p>
                  }
                  </div>
                </TabPanel>
              </TabsBody>
            </Tabs>
          </div>
  )
}
