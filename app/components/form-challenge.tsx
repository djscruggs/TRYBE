import React, {
  useState,
  useEffect,
  useRef,
  type ChangeEvent
} from 'react'
import { Form, useNavigate } from '@remix-run/react'
import type { ObjectData } from '~/utils/types.server'
import { Button, Select, Option } from '@material-tailwind/react'
import { FormField } from '~/components/form-field'
import DatePicker from 'react-datepicker'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import { colorToClassName, iconStyle } from '~/utils/helpers'
// icons
import { GiShinyApple, GiMeditation } from 'react-icons/gi'
import { FaRegLightbulb } from 'react-icons/fa6'
import { RiMentalHealthLine } from 'react-icons/ri'
import { PiBarbellLight } from 'react-icons/pi'
import { IoFishOutline } from 'react-icons/io5'

export default function FormChallenge (props: ObjectData): JSX.Element {
  const frequencies = ['DAILY', 'WEEKDAYS', 'ALTERNATING', 'WEEKLY', 'CUSTOM']
  const navigate = useNavigate()
  const challengeForm = useRef(null)
  const [errors, setErrors] = useState(props.errors)
  // make a copy so it doesn't affect parent renders
  const challenge = { ...props.challenge }
  delete challenge._count
  const [formData, setFormData] = useState(challenge)

  function selectDate (name: string, value: Date): void {
    setFormData((prevFormData: ObjectData) => ({
      ...prevFormData,
      [name]: value
    }))
  }
  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = event.target
    setFormData((prevFormData: ObjectData) => ({
      ...prevFormData,
      [name]: value
    }))
  }
  function handleSelect (value: string | undefined): void {
    setFormData((prevFormData: ObjectData) => ({
      ...prevFormData,
      frequency: value
    }))
  }
  const colorOptions = [
    'red',
    'orange',
    'yellow',
    'green',
    'blue',
    'pink',
    'purple'
  ]
  function handleColorChange (value: string): void {
    setFormData((prevFormData: ObjectData) => ({
      ...prevFormData,
      color: value
    }))
  }
  const iconOptions: Record<string, JSX.Element> = {
    GiShinyApple: <GiShinyApple className={iconStyle(formData?.color as string)} />,
    GiMeditation: <GiMeditation className={iconStyle(formData?.color as string)} />,
    FaRegLightbulb: <FaRegLightbulb className={iconStyle(formData?.color as string)} />,
    RiMentalHealthLine: <RiMentalHealthLine className={iconStyle(formData?.color as string)} />,
    PiBarbellLight: <PiBarbellLight className={iconStyle(formData?.color as string)} />,
    IoFishOutline: <IoFishOutline className={iconStyle(formData?.color as string)} />
  }
  const handleIconChange = (value: string): void => {
    setFormData((prevFormData: ObjectData) => ({
      ...prevFormData,
      icon: value
    }))
  }
  function handleCancel (event: React.FormEvent): void {
    event.preventDefault()
    navigate(-1)
  }
  async function handleSubmit (event: React.FormEvent): Promise<void> {
    event.preventDefault()
    const url = '/api/challenges'
    const headers = {
      headers: {
        'content-type': 'multipart/form-data'
      }
    }
    const toSubmit = new FormData()
    for (const key in formData) {
      if (key === 'id') continue
      if (Object.prototype.hasOwnProperty.call(formData, key)) {
        const value = formData[key]
        if (typeof value === 'string') {
          toSubmit.append(key, value)
        } else if (value instanceof Blob) {
          toSubmit.append(key, value)
        } else {
          toSubmit.append(key, String(value))
        }
      }
    }
    toSubmit.set('coverPhoto', String(formData.coverPhoto))
    if (file !== null) {
      toSubmit.append('photo', file)
    }
    if (formData.id !== undefined) {
      toSubmit.append('id', String(formData.id))
    }
    const response = await axios.post(url, toSubmit, headers)
    console.log('response', response)
    const msg = formData.id !== null ? 'Challenge saved' : 'Challenge created'
    if (!response.data.id || response.data.errors) {
      if (response.data.errors) {
        setErrors(response.data.errors)
      } else {
        toast.error('An error occured')
      }
    } else {
      toast.success(msg)
      navigate(`/challenges/${response.data.id}`)
    }
  }
  const [file, setFile] = useState<File | null>(null)
  const [fileDataURL, setFileDataURL] = useState<string | null>(formData.coverPhoto ? String(formData.coverPhoto) : null)

  const handlePhoto = (e: ChangeEvent<HTMLInputElement>): void => {
    const { files } = e.target
    if (!files) return
    const image = files[0]
    if (image.size > 1_000_000) {
      toast.error('Image must be less than 1MB')
      return
    }
    setFile(image)
    const fileReader = new FileReader()
    fileReader.onload = (e) => {
      const result = e.target?.result
      if (result) {
        if (typeof result === 'string') {
          setFileDataURL(result)
        } else {
          setFileDataURL(null)
        }
      }
    }
    fileReader.readAsDataURL(image)
  }

  useEffect(() => {
    let fileReader: FileReader | null = null
    let isCancel = false
    if (file) {
      fileReader = new FileReader()
      fileReader.onload = (e) => {
        const result = e.target?.result
        if (result && !isCancel) {
          if (typeof result === 'string') {
            setFileDataURL(result)
          } else {
            setFileDataURL(null)
          }
        }
      }
      fileReader.readAsDataURL(file)
    }
    return () => {
      isCancel = true
      if (fileReader && fileReader.readyState === 1) {
        fileReader.abort()
      }
    }
  }, [file])
  const fileInput = (): JSX.Element => {
    const textColor = fileDataURL ? 'white' : 'blue-gray-50'
    return (
      <input type="file"
        name="coverPhoto"
        onChange={handlePhoto}
        accept="image/*"
        className={`text-sm text-${textColor}
                  file:text-white
                    file:mr-5 file:py-2 file:px-6
                    file:rounded-full file:border-0
                    file:text-sm file:font-medium
                    file:bg-blue-50 file:text-blue-700
                    file:cursor-pointer file:bg-blue
                    hover:file:bg-red`}
      />
    )
  }
  return (
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          <Form method="post" ref={challengeForm} encType="multipart/form-data" onSubmit={handleSubmit}>
            {/* this is here so tailwind generates the correct classes, should be moveed to tailwind.config.js file */}
            <div className='hidden'>
            <div className='text-purple-400 bg-purple-400 border-purple-400'>purple</div>
            <div className='bg-gradient-to-b from-purple-400 to-white'>gradient</div>
            <div className='text-pink-300 bg-pink-300 border-pink-300'>pink</div>
            <div className='bg-gradient-to-b from-pink-300 to-white'>gradient</div>
            <div className='text-blue-500 bg-blue border-blue'>blue</div>
            <div className='bg-gradient-to-b from-blue to-white'>gradient</div>
            <div className='text-yellow bg-yellow border-yellow'>yellow</div>
            <div className='bg-gradient-to-b from-yellow to-white'>gradient</div>
            <div className='text-orange-500 bg-orange-500 border-orange-500'>orange</div>
            <div className='bg-gradient-to-b from-orange-500 to-white'>gradient</div>
            <div className='text-red bg-red border-red'>red</div>
            <div className='bg-gradient-to-b from-red to-white'>gradient</div>
            <div className='text-green-500 bg-green-500 border-green-500'>green</div>
            <div className='bg-gradient-to-b from-green-500 to-white'>gradient</div>
            <div className='text-grey bg-grey border-grey'>grey</div>
            <div className='bg-gradient-to-b from-grey to-white'>gradient</div>
            </div>
            <div className="relative max-w-sm">

              <div className="relative mb-2">
                <FormField
                  name='name'
                  placeholder='Give your challenge a catchy name'
                  required={true}
                  value={formData.name}
                  onChange={handleChange}
                  error={errors?.name?._errors[0]}
                  label="Name of Challenge" />
              </div>
              {/* material-tailwind <Select> element doesn't populate an actual HTML input element, so this hidden field captres the value for submission */}
              <input type="hidden" name='frequency' value={formData.frequency} />
              <div className="relative flex mb-2">
                <Select
                  label="Select frequency"
                  placeholder='frequency'
                  name="_frequency"
                  value={formData.frequency}
                  onChange={handleSelect}
                  >
                  {frequencies.map((frequency: string, index: number) => (
                      <Option key={index} value={frequency}>{frequency.charAt(0).toUpperCase() + frequency.slice(1).toLowerCase()}</Option>
                  ))
                  }
                </Select>
              </div>
              <div className="relative flex mb-2">
              <div className="relative max-w-[200px]">
                <label>Start Date</label>

                <DatePicker
                  name='startAt'
                  required={true}
                  dateFormat="MM-dd-YYYY"
                  selected={formData.startAt ? new Date(formData.startAt) : null}
                  onChange={(date: Date) => { selectDate('startAt', date) }}
                  className='p-1 border border-slate-gray-500 rounded-md my-2 pl-2'
                  />
                {errors?.startAt && (
                  <div className="text-xs font-semibold text-left tracking-wide text-red w-full mb-4">
                    {errors?.startAt._errors[0]}
                  </div>
                )}
              </div>
              <div className="relative max-w-[200px]">
                <label>End Date</label>
                <DatePicker
                  name='endAt'
                  required={true}
                  dateFormat="MM-dd-YYYY"
                  selected={formData.endAt ? new Date(formData.endAt) : null}
                  onChange={(date: Date) => { selectDate('endAt', date) }}
                  className='p-1 border border-slate-gray-500 rounded-md my-2 pl-2'
                  />
                {errors?.endAt && (
                  <div className="text-xs font-semibold text-left tracking-wide text-red w-full mb-4">
                    {errors?.endAt._errors[0]}
                  </div>
                )}
            </div>
              </div>

              <div className="relative my-2">
                <FormField
                  name='description'
                  placeholder='Develop a new habit, eat healthy and lower your carbon footprint'
                  required={true}
                  type="textarea"
                  rows={2}
                  value={formData.description}
                  onChange={handleChange}
                  error={errors?.description?._errors[0]}
                  label="Description"
                />
              </div>
              <div className="relative my-2">
                <FormField
                  name='mission'
                  placeholder='Eat vegetarian every day for two weeks. Check in daily to stay on track.'
                  required={true}
                  type="textarea"
                  rows={4}
                  value={formData.mission}
                  onChange={handleChange}
                  error={errors?.description?._errors[0]} label="Mission"
                />
              </div>
              <div className='w-full'>
                  {fileDataURL &&
                    <label htmlFor='coverPhoto' className='mb-2 block'>Cover Photo</label>
                  }
                <div className='w-full my-4 bg-blue-gray-50 h-40 rounded-md flex items-center justify-center'>
                  {fileDataURL &&
                    <img src={fileDataURL} alt="cover photo" className="max-w-full max-h-40" />
                  }
                  {!fileDataURL &&
                    <div className="flex flex-col items-center justify-end">
                      <p className="text-2xl text-blue-gray-500 text-center">Upload a cover photo</p>
                      <div className='mt-10 ml-36'>
                        {fileInput()}
                      </div>
                    </div>
                  }
                </div>
                <div className='mt-8 mb-4'>
                  {fileDataURL && fileInput()}
                </div>
              </div>
              <label>Color</label>
              <div className="relative my-2 flex flex-wrap">
                {colorOptions.map((option, index) => (
                  <div key={index} onClick={() => { handleColorChange(option) }} className={`w-10 h-10 cursor-pointer rounded-full bg-${colorToClassName(option, 'red')} mr-2 mb-2 ${formData.color === option ? 'outline outline-2 outline-offset-2 outline-darkgrey' : ''}`}></div>
                ))}
              </div>
              <label>Icon</label>
              <div className="relative my-2 flex flex-wrap">
                {Object.keys(iconOptions).map((key, index) => (
                  <div key={key} onClick={() => { handleIconChange(key) }} className={`w-12 h-12 cursor-pointer rounded-full mr-4 mb-2 ${formData.icon === key ? 'outline outline-2 outline-offset-2 outline-darkgrey' : ''}`}>{iconOptions[key]}</div>
                ))}
              </div>

              {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
              <Button type="submit" onClick={handleSubmit} placeholder='Save' className="bg-blue">Save Challenge</Button>
              <Button type="submit" onClick={handleCancel} placeholder='Cancel' className="ml-2 bg-red">Cancel</Button>
            </div>
          </Form>
  )
}
