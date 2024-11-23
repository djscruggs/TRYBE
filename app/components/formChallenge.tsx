import React, {
  useState,
  useContext,
  useRef,
  useEffect,
  type ChangeEvent
} from 'react'
import { Form, useNavigate } from '@remix-run/react'
import axios from 'axios'
import type { Category, Challenge } from '~/utils/types'
import { Button, Select, Option, Radio, Menu, MenuHandler, MenuItem, MenuList, Checkbox } from '@material-tailwind/react'
import { FormField } from '~/components/formField'
import DatePicker from 'react-datepicker'
import { addDays, endOfMonth, isFirstDayOfMonth } from 'date-fns'
import { toast } from 'react-hot-toast'
import { colorToClassName, handleFileUpload } from '~/utils/helpers'
import { useRevalidator } from 'react-router-dom'
import { CurrentUserContext } from '~/utils/CurrentUserContext'
import CardChallenge from '~/components/cardChallenge'

import ChallengeIcon, { iconFiles } from '~/components/challengeIcon'
interface Errors {
  name?: string
  description?: string
  icon?: string
  category?: string
  startAt?: string
  endAt?: string
  coverPhoto?: string
  categories?: string
}

interface ChallengeInputs extends Challenge {
  deleteImage: boolean
}
export default function FormChallenge ({ challenge }: { challenge: ChallengeInputs }): JSX.Element {
  const frequencies: Array<Challenge['frequency']> = ['DAILY', 'WEEKDAYS', 'WEEKLY']
  const navigate = useNavigate()
  const challengeForm = useRef(null)
  const revalidator = useRevalidator()
  const [errors, setErrors] = useState<Errors>()
  const [image, setImage] = useState<File | null>(null)
  // make a copy so it doesn't affect parent renders
  if (challenge?._count) {
    delete challenge._count
  }
  const [formData, setFormData] = useState<Partial<ChallengeInputs>>({
    deleteImage: false,
    ...(typeof challenge === 'object' && challenge !== null ? challenge : {})
  })
  const { currentUser } = useContext(CurrentUserContext)
  const localDateFormat = currentUser?.locale === 'en-US' ? 'M-dd-YYYY' : 'dd-M-YYYY'
  function selectDate (name: string, value: Date): void {
    setFormData((prevFormData: typeof formData) => ({
      ...prevFormData,
      [name]: value
    }))
    // if no end date set, default to 30 days from now
    if (name === 'startAt') {
      if (!formData.endAt) {
        const newEnd = calculateEndDate(value)
        setFormData((prevFormData: typeof formData) => ({
          ...prevFormData,
          endAt: newEnd
        }))
      }
    }
  }
  function calculateEndDate (startAt: Date): Date {
    if (isFirstDayOfMonth(startAt)) {
      const endAt = endOfMonth(startAt)
      return endAt
    }
    const endAt = addDays(startAt, 30)
    return endAt
  }
  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = event.target
    if (name === 'public') {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value === 'true'
      }))
      return
    }
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value
    }))
  }
  function handleTemplateChange (event: ChangeEvent<HTMLInputElement>): void {
    setFormData((prevFormData) => ({
      ...prevFormData,
      template: event.target.checked
    }))
  }
  function handleSelect (value: Challenge['frequency']): void {
    setFormData((prevFormData) => ({
      ...prevFormData,
      frequency: value
    }))
  }
  function handleIconChange (value: string): void {
    setFormData((prevFormData) => ({
      ...prevFormData,
      icon: value
    }))
  }
  const colorOptions = [
    'red',
    'orange',
    'salmon',
    'yellow',
    'green',
    'blue',
    // 'pink',
    'purple'
  ]
  function handleColorChange (value: string): void {
    setFormData((prevFormData) => ({
      ...prevFormData,
      color: value
    }))
  }

  function handleCancel (event: React.FormEvent): void {
    event.preventDefault()
    navigate(-1)
  }
  function parseErrors (errors: any, path: string = ''): Record<string, string> {
    let result: Record<string, string> = {}

    for (const key in errors) {
      if (key === '_errors') {
        result[path] = errors[key][0]
      } else if (typeof errors[key] === 'object') {
        const nestedErrors = parseErrors(errors[key], path ? `${path}.${key}` : key)
        result = { ...result, ...nestedErrors }
      }
    }

    return result
  }
  async function handleSubmit (event: React.FormEvent): Promise<void> {
    event.preventDefault()
    // validation
    const validation: Errors = {}
    if (formData.name?.trim() === '') { validation.name = 'Name is required' }
    if (formData.description?.trim() === '') { validation.description = 'Description is required' }
    if (!formData.startAt) { validation.startAt = 'Start date is required' }
    if (!formData.endAt) { validation.endAt = 'End date is required' }
    if (!formData.icon) { validation.icon = 'Icon is required' }
    if (formData.categories?.length === 0) { validation.categories = 'Category is required' }
    if (Object.keys(validation).length > 0) {
      setErrors(validation)
      return
    }
    const toSubmit = new FormData()
    for (const key in formData) {
      if (key === 'id' || key === 'coverPhotoMeta') continue
      if (key === 'categories') {
        toSubmit.append(key, JSON.stringify(formData.categories?.map(category => category.id)))
      } else if (Object.prototype.hasOwnProperty.call(formData, key)) {
        const value = formData[key as keyof typeof formData]
        if (typeof value === 'string') {
          toSubmit.append(key, value)
        } else if (value instanceof Blob) {
          toSubmit.append(key, value)
        } else {
          toSubmit.append(key, String(value))
        }
      }
    }
    if (formData.deleteImage) {
      toSubmit.set('deleteImage', 'true')
    }
    if (image !== null) {
      toSubmit.append('image', image)
    }
    if (formData?.id) {
      toSubmit.append('id', String(formData.id))
    }
    const url = '/api/challenges'
    const headers = {
      headers: {
        'content-type': 'multipart/form-data'
      }
    }
    const response = await axios.post(url, toSubmit, headers)
    const msg = (formData.id !== null) ? 'Challenge saved' : 'Challenge created'
    if (!response.data.id || response.data.errors) {
      toast.error('An error occured')
      console.error('errors', response.data)
      if (response.data.errors) {
        console.error('errors', response.data.errors)
        const parsedErrors = parseErrors(response.data.errors)
        setErrors(parsedErrors as Errors)
      }
    } else {
      revalidator.revalidate()
      toast.success(msg)
      navigate(`/challenges/v/${response.data.id}`, { replace: true })
    }
  }

  const [categories, setCategories] = useState<Category[]>([])
  useEffect(() => {
    const loadCategories = async (): Promise<void> => {
      const categories = await axios.get('/api/categories')
      setCategories(categories.data.categories as Category[])
    }
    void loadCategories()
  }, [])
  function handleCategoryChange (e: ChangeEvent<HTMLInputElement>): void {
    const value = Number(e.target.value)
    const checked = e.target.checked
    const currentCategoryIds = formData.categories?.map(category => category.id)
    if (checked) {
      if (!currentCategoryIds?.includes(value)) {
        setFormData((prevFormData) => ({
          ...prevFormData,
          categories: [...prevFormData.categories ?? [], { id: value }]
        }))
      }
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        categories: prevFormData.categories?.filter(c => c.id !== value)
      }))
    }
  }
  return (
      <>
        <div className='w-full flex justify-center md:justify-start'>
          <Form method="post" ref={challengeForm} encType="multipart/form-data" onSubmit={handleSubmit}>
            {/* this is here so tailwind generates the correct classes, should be moveed to tailwind.config.js file */}

            <div className="w-full max-w-[600px] md:max-w-[1200px] px-2 grid grid-cols-1 md:grid-cols-2  ">
              <div className="col-span-2 w-full lg:col-span-1">
                <div className="relative mb-2 max-w-[400px]">
                  <FormField
                    name='name'
                    placeholder='Give your challenge a catchy name'
                    required={true}
                    value={formData.name}
                    onChange={handleChange}
                    error={errors?.name}
                    label="Name of Challenge" />
                </div>
                <fieldset className="mb-4">
                  <legend className="text-lg mb-2">Categories</legend>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                    {categories.map((category: Category) => (
                      <div key={category.id} className="flex items-center mb-2">
                        <Checkbox
                          crossOrigin={undefined}
                          id={`category-${category.id}`}
                          name="categories"
                          value={String(category.id)}
                          checked={formData.categories?.some(c => c.id === category.id)}
                          onChange={handleCategoryChange}
                        />
                        <label htmlFor={`category-${category.id}`} className="ml-2 capitalize">
                          {category.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </fieldset>
                {/* material-tailwind <Select> element doesn't populate an actual HTML input element, so this hidden field captres the value for submission */}
                <input type="hidden" name='frequency' value={formData.frequency} />
                <div className="relative mb-2 max-w-[400px] text-sm">
                  <label htmlFor='public'>Who can join?</label>
                  <div className="flex items-center space-x-2">
                    <Radio
                      name='public'
                      value='true'
                      label='Anyone'
                      checked={formData.public}
                      onChange={handleChange}
                      crossOrigin={undefined}
                    />

                  </div>
                  <div className="flex items-center space-x-2">
                    <Radio
                      name='public'
                      value='false'
                      label='Invite only'
                      checked={!formData.public}
                      onChange={handleChange}
                      crossOrigin={undefined}
                    />
                  </div>
                </div>
                <div className="max-w-[400px] relative flex mb-2">
                  <Select
                    label="Select frequency"
                    placeholder='frequency'
                    name="_frequency"
                    value={formData.frequency}
                    onChange={handleSelect}
                    >
                    {frequencies.map((frequency: Challenge['frequency'], index: number) => (
                        <Option key={index} value={frequency}>{frequency.charAt(0).toUpperCase() + frequency.slice(1).toLowerCase()}</Option>
                    ))
                    }
                  </Select>
                </div>
                <div className="relative flex flex-col mb-2 md:flex-row md:space-x-2">
                  <div className="relative max-w-[200px] mr-2">
                    <label>Start Date</label>

                    <DatePicker
                      name='startAt'
                      required={true}
                      dateFormat={localDateFormat}
                      minDate={new Date()}
                      selected={formData.startAt ? new Date(formData.startAt) : null}
                      onChange={(date: Date) => { selectDate('startAt', date) }}
                      className={`p-1 border rounded-md pl-2 ${errors?.startAt ? 'border-red' : 'border-slate-gray-500'}`}
                      />
                    {errors?.startAt && (
                      <div className="text-xs font-semibold text-left tracking-wide text-red w-full mb-4">
                        {errors?.startAt}
                      </div>
                    )}
                  </div>
                  <div className="relative max-w-[200px] mr-2">
                    <label>End Date</label>
                    <DatePicker
                      name='endAt'
                      required={true}
                      dateFormat={localDateFormat}
                      minDate={formData.startAt ? addDays(new Date(formData.startAt), 7) : addDays(new Date(), 7)}
                      selected={formData.endAt ? new Date(formData.endAt) : null}
                      onChange={(date: Date) => { selectDate('endAt', date) }}
                      className={`p-1 border rounded-md pl-2 ${errors?.endAt ? 'border-red' : 'border-slate-gray-500'}`}
                      />
                    {errors?.endAt && (
                      <div className="text-xs font-semibold text-left tracking-wide text-red w-full mb-4">
                        {errors?.endAt}
                      </div>
                    )}
                  </div>
                </div>

                <div className="relative max-w-[400px]">
                  <FormField
                    name='description'
                    placeholder='Share a short description of what this challenge is all about'
                    required={true}
                    type="textarea"
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    error={errors?.description}
                    label="Description"
                  />
                </div>
                <div className="max-w-[400px] relative flex flex-wrap">
                  <label className='w-full block mb-2 text-left'>Color</label>
                  {colorOptions.map((option, index) => (
                    <div key={index} onClick={() => { handleColorChange(option) }} className={`w-10 h-10 cursor-pointer rounded-full bg-${colorToClassName(option, 'red')} mr-2 mb-2 ${formData.color === option ? 'outline outline-2 outline-offset-2 outline-darkgrey' : ''}`}></div>
                  ))}
                </div>
                {/* <div className='w-full mt-4'>
                  <CoverPhotoHandler formData={formData} setFormData={setFormData} image={image} setImage={setImage} />
                </div> */}
              </div>
              <div className="max-w-[400px] sm:col-span-2 md:ml-4 lg:col-span-1">
                <div className='mb-4'>
                <label>Preview</label>
                <Preview data={formData}/>
                </div>

                <div className="mt-4 max-w-[400px]">
                  {errors?.icon && (
                      <div className="text-xs font-semibold text-left tracking-wide text-red w-full mb-4">
                        {errors?.icon}
                      </div>
                  )}
                  <Menu>
                    <MenuHandler className="flex justify-center items-center">
                      <div className="flex items-center justify-center gap-2 cursor-pointer">
                        <>
                          <div className="flex flex-col items-center justify-center">
                            <ChallengeIcon icon={formData.icon as string | undefined} />
                            <Button className="mt-4">Select Icon</Button>
                          </div>
                        </>
                      </div>
                    </MenuHandler>
                    <MenuList className="justify-start items-start grid grid-cols-3">
                    {Object.entries(iconFiles).map(([img, width]) => (
                      <MenuItem key={img}>
                        <img src={`/images/icons/${img}`} width={Math.round(width * 0.6)} onClick={() => { handleIconChange(img) }} className={`cursor-pointer ${formData.icon === img ? ' outline outline-2  outline-darkgrey rounded-md' : ''}`} />
                      </MenuItem>
                    ))}
                  </MenuList>
                </Menu>
                </div>
              </div>
            </div>
            {currentUser?.role === 'ADMIN' &&
              <div className='mt-4'>
                <Checkbox
                  name='template'
                  label='Save as a template'
                  checked={formData.template}
                  onChange={handleTemplateChange}
                  crossOrigin={undefined}
                />
              </div>
            }
            <div className="mt-8 flex justify-left">
              <Button type="submit" onClick={handleSubmit} placeholder='Save' className="bg-red hover:bg-green-500 rounded-full">Save Challenge</Button>
              <button onClick={handleCancel} className="underline ml-4 4 hover:text-red">cancel</button>
            </div>

          </Form>
        </div>
      </>
  )
}

const Preview = ({ data }: { data: any }): JSX.Element => {
  return (
    <>
      <CardChallenge challenge={data} isPreview={true} />
    </>
  )
}

interface imageInputProps {
  imageURL: string | null
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
}
const ImageInput = (props: imageInputProps): JSX.Element => {
  const { imageURL, onChange } = props
  const textColor = imageURL ? 'white' : 'blue-gray-50'
  return (
    <input type="file"
      name="image"
      onChange={onChange}
      accept="image/*"
      className={`text-sm text-${textColor}
                file:text-white
                  file:mr-5 file:py-2 file:px-6
                  file:rounded-full file:border-0
                  file:text-sm file:font-medium
                  file:bg-blue-50 file:text-blue-700
                  file:cursor-pointer file:bg-red
                  hover:file:bg-green-500`}
    />
  )
}

const CoverPhotoHandler = ({ formData, setFormData, image, setImage }: { formData: Partial<ChallengeInputs>, setFormData: (formData: Partial<ChallengeInputs>) => void, image: File | null, setImage: (image: File | null) => void }): JSX.Element => {
  const [imageURL, setImageURL] = useState<string | null>(formData.coverPhotoMeta?.secure_url ? String(formData.coverPhotoMeta.secure_url) : null)

  const handleCoverPhoto = (event: ChangeEvent<HTMLInputElement>): void => {
    const params = {
      event,
      setFile: setImage,
      setFileURL: setImageURL
    }
    // set coverPhoto to null when photo added after a delete
    handleFileUpload(params)
  }
  const removeImage = (): void => {
    setImage(null)
    setImageURL(null)
    setFormData((prevFormData: Partial<ChallengeInputs>): Partial<ChallengeInputs> => ({
      ...prevFormData,
      deleteImage: true
    }))
  }
  return (
    <>
      <div className={`max-w-md mb-2 h-60 rounded-md flex items-center justify-center ${imageURL ? '' : 'bg-blue-gray-50'}`}>
        {imageURL &&
          <>
          <img src={imageURL} alt="cover photo" className="max-w-full max-h-60" />
          </>
        }
        {!imageURL &&
          <div className="flex flex-col items-center justify-end">
            <p className="text-2xl text-blue-gray-500 text-center">Upload a cover photo</p>
            <div className='mt-10 ml-36'>
              <ImageInput imageURL={imageURL} onChange={handleCoverPhoto} />
            </div>
          </div>
        }
      </div>
      <div className='px-[28%] justify-center items-center'>
        {imageURL &&
          <>
            <ImageInput imageURL={imageURL} onChange={handleCoverPhoto} />
            <div onClick={removeImage} className='underline ml-[130px] -mt-8 cursor-pointer'>remove</div>
          </>
}

      </div>
    </>
  )
}
