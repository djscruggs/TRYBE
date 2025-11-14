// import * as pkg from '~/utils/material-tailwind';
import { useNavigate, useLocation, useRevalidator } from 'react-router';
import { useState, useContext, JSX } from 'react'
import { CurrentUserContext } from '~/contexts/CurrentUserContext'
import { type Challenge, type ChallengeSummary } from '~/utils/types'
import { Button, Menu, MenuHandler, MenuList, MenuItem } from '~/utils/material-tailwind';
import DialogDelete from './dialogDelete'
import { GiHamburgerMenu } from 'react-icons/gi'
import axios from 'axios'
import { toast } from 'react-hot-toast'
// const { type MenuProps } = pkg;
import { useMobileSize } from '~/hooks/useMobileSize'

interface MenuChallengeProps {
  challenge: Challenge | ChallengeSummary
}
export default function MenuChallenge (props: MenuChallengeProps): JSX.Element {
  const { challenge } = props
  const isMobile = useMobileSize()
  const placement: MenuProps['placement'] = isMobile ? 'bottom-end' : 'bottom-start'
  const navigate = useNavigate()
  const { currentUser } = useContext(CurrentUserContext)
  const [deleteDialog, setDeleteDialog] = useState(false)
  const revalidator = useRevalidator()
  const handleDeleteDialog = (event: any): void => {
    event.preventDefault()
    event.stopPropagation()
    setDeleteDialog(true)
  }
  const cancelDialog = (event: any): void => {
    event.preventDefault()
    event.stopPropagation()
    setDeleteDialog(false)
  }
  const handleDelete = async (event: any): Promise<void> => {
    if (!challenge?.id) {
      throw new Error('cannot delete without an id')
    }
    const url = `/api/challenges/delete/${challenge.id as string | number}`
    const response = await axios.post(url)
    if (response.status === 204) {
      toast.success('Challenge deleted')
      revalidator.revalidate()
      navigate('/challenges')
    } else {
      toast.error('Delete failed')
    }
  }
  return (
    <>
    {challenge?.userId === currentUser?.id && (
      <>
        <Menu placement={placement}>
          <MenuHandler>
            <Button className='bg-red p-1 rounded-md focus-visible:outline-none'>
              <GiHamburgerMenu className='h-5 w-5'/>
            </Button>
          </MenuHandler>
          <MenuList>
            <MenuItem onClick={() => { navigate(`/posts/new/challenge/${challenge.id}`) }}>
              Post an Update
            </MenuItem>
            {/* <MenuItem onClick={() => { navigate(`/threads/new/challenge/${challenge.id}`) }} >
              Start a Discussion
            </MenuItem> */}
            <MenuItem onClick={() => { navigate(`/challenges/v/${challenge.id}/edit`) }}>Edit Challenge</MenuItem>
            <MenuItem onClick={() => { navigate(`/challenges/v/${challenge.id}/schedule`) }}>Edit Schedule</MenuItem>
            <MenuItem onClick={handleDeleteDialog}>
              Delete
            </MenuItem>
          </MenuList>
        </Menu>
      {deleteDialog && <DialogDelete prompt='Are you sure you want to delete this challenge?' isOpen={deleteDialog} deleteCallback={handleDelete} onCancel={cancelDialog}/>}
      </>
    )}
    </>
  )
}
