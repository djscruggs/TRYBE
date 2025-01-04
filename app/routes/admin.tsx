import { type LoaderFunctionArgs, redirect } from '@remix-run/node'
import { json } from '@remix-run/node'
import { prisma } from '~/models/prisma.server'
import { getCurrentUser } from '~/models/auth.server'
import { useLoaderData } from '@remix-run/react'
import DataTable from 'react-data-table-component'
import type { MemberChallenge, Challenge } from '@prisma/client'
export const loader = async (args: LoaderFunctionArgs) => {
  const currentUser = await getCurrentUser(args)
  if (!currentUser) {
    return redirect('/')
  }
  if (currentUser.role !== 'ADMIN') {
    return redirect('/')
  }
  const users = await prisma.user.findMany({
    include: {
      memberChallenges: {
        include: {
          challenge: true
        }
      },
      profile: true,
      challenges: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
  return json({ users })
}
interface DateRow {
  createdAt: Date
}
const sortByDate = (rowA: DateRow, rowB: DateRow) => {
  const a = new Date(rowA.createdAt)
  const b = new Date(rowB.createdAt)

  if (a > b) {
    return 1
  }

  if (b > a) {
    return -1
  }
  return 0
}

export default function Admin (): React.ReactNode {
  const { users } = useLoaderData<typeof loader>()
  const columns = [
    {
      name: 'Name',
      sortable: true,
      selector: (row: any) => (row.profile?.fullName ?? 'anonymous') + (row.role === 'ADMIN' ? ' (Admin)' : ''),
      maxWidth: '200px'
    },
    {
      name: 'Email',
      selector: (row: any) => row.email,
      maxWidth: '200px'
    },
    {
      name: 'Members of',
      selector: (row: any) => (
        <div>
          {row.memberChallenges?.map((member: MemberChallenge, index: number) => (
            <span key={index} className="block mb-2">
              {member.challenge?.name}
            </span>
          ))}
        </div>
      ),
      maxWidth: '200px'
    },
    {
      name: 'Challenges created',
      selector: (row: any) => (
        <div>
          {row.challenges?.map((challenge: Challenge, index: number) => (
            <span key={index} className="block mb-2">
              {challenge.name}
            </span>
          ))}
        </div>
      ),
      maxWidth: '300px',
      wrap: true
    },
    {
      name: 'Joined on',
      selector: (row: any) => new Date(row.createdAt as Date).toLocaleDateString(),
      maxWidth: '200px',
      sortable: true,
      sortFunction: sortByDate
    }
  ]

  return (
    <>
      <div className="mt-10">
        <h1 className="text-2xl font-bold">Users</h1>

      </div>
      <DataTable
        columns={columns}
        data={users}
        pagination
        highlightOnHover
        dense
        paginationPerPage={20}
        paginationRowsPerPageOptions={[10, 25, 50, 100]}
      />
    </>
  )
}
