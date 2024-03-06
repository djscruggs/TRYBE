
import { 
  useState, 
  useEffect,
  useRef,
  ChangeEvent, 
} from 'react';
import { Form } from "@remix-run/react";
import { useNavigate } from '@remix-run/react';
import type {ObjectData} from '~/utils/types.server'
import { Button, Select, Option, Menu, MenuHandler, MenuList, MenuItem}  from "@material-tailwind/react";
import { FormField } from "~/components/form-field";
import DatePicker from "react-datepicker";
import { CurrentUserContext } from '../utils/CurrentUserContext';
import { useContext } from "react";
import { toast } from 'react-hot-toast';
import axios from 'axios'
import { colorToClassName } from '~/utils/helpers'


export default function FormChallenge(props:ObjectData) {
  const frequencies = ["DAILY","WEEKDAYS","ALTERNATING","WEEKLY","CUSTOM"]
  const navigate = useNavigate()
  const challengeForm = useRef(null)
  const [errors, setErrors] = useState(props.errors);
  const [formData, setFormData] = useState(props.object)
  const {currentUser} = useContext(CurrentUserContext)
  
  function selectDate(name:string, value:Date) {
    setFormData((prevFormData: ObjectData) => ({
      ...prevFormData,
      [name]: value,
    }));
  }
  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = event.target;
    setFormData((prevFormData: ObjectData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };
  function handleSelect(value: string | undefined){
    setFormData((prevFormData: ObjectData) => ({
      ...prevFormData,
      ['frequency']: value,
    }));
  }
  function handleColorChange(value: string){
    setFormData((prevFormData: ObjectData) => ({
      ...prevFormData,
      ['color']: value,
    }));
  }
  async function handleSubmit(event: any){
    event.preventDefault()
    const url = '/api/challenges'
    const headers = {headers: {
      'content-type': 'multipart/form-data'
    }}
    const toSubmit = new FormData();
    for (const key in formData) {
      if(key ===  'id') continue
      if (formData.hasOwnProperty(key)) {
        toSubmit.append(key, formData[key]);
      }
    }
    toSubmit.set('coverPhoto', formData.coverPhoto)
    if(file){
      toSubmit.append('photo',file)
    }
    if(formData.id){
      toSubmit.append('id',formData.id)
    }
    const response = await axios.post(url, toSubmit, headers);
    const  msg = formData.id?'Challenge saved':'Challenge created';
    
    if(response.data.errors){
      console.log('errors', response.data.errors)
      setErrors(response.data.errors)
    } else {
      toast.success(msg)
      navigate(`/challenges/${response.data.id}`)
    }
  }
  const [file,setFile] = useState<File | null>(null);
  const [fileDataURL, setFileDataURL] = useState<string | null>(formData.coverPhoto ? String(formData.coverPhoto) : null);

  const handlePhoto = async (e: ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target
    if(!files) return
    
    const image = files[0]
    if(image.size > 1_000_000){
      toast.error('Image must be less than 1MB')
      return
    }
    setFile(image);
    console.log(image)
    const fileReader = new FileReader();
    const url = fileReader.readAsDataURL(image);
    setFormData((prevFormData: ObjectData) => ({
      ...prevFormData,
      coverPhoto: image.name,
    }));
  }
  useEffect(() => {
    let fileReader:FileReader | null = null 
    let isCancel = false;
    if (file) {
      fileReader = new FileReader();
      fileReader.onload = (e) => {
        const { result } = e.target  as FileReader;
        if (result && !isCancel) {
          if (typeof result === 'string') {
            setFileDataURL(result);
          } else {
            setFileDataURL(null);
          }
        }
      }
      fileReader.readAsDataURL(file);
    }
    return () => {
      isCancel = true;
      if (fileReader && fileReader.readyState === 1) {
        fileReader.abort();
      }
    }

  }, [file]);
  const fileInput = () => {
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
    );
  }
  const colorOptions = [
    'red',
    'orange',
    'yellow',
    'green',
    'blue',
    'pink',
    'purple',
  ];
  return  (
          <Form method="post" ref={challengeForm} encType="multipart/form-data" onSubmit={handleSubmit}>
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
              <input type="hidden" name='frequency' value={formData.frequency}  />
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
                  onChange={(date:Date) => selectDate('startAt', date)} 
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
                  selected={formData.endAt ? new Date(formData.endAt): null} 
                  onChange={(date:Date) => selectDate('endAt', date)} 
                  className='p-1 border border-slate-gray-500 rounded-md my-2 pl-2'  
                  />
                {errors?.endAt && (
                  <div className="text-xs font-semibold text-left tracking-wide text-red w-full mb-4">
                    {errors?.endAt._errors[0]}
                  </div>
                )}
            </div>
              </div>
              <div className='w-full'>
                  {fileDataURL &&
                    <label htmlFor='coverPhoto' className='mb-2 block'>Cover Photo</label>
                  }
                <div className='w-full my-4 bg-blue-gray-50 h-40 rounded-md flex items-center justify-center'>
                  {fileDataURL &&
                    <img src={fileDataURL} alt="cover photo" className="max-w-full maxh-40" />
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
                
                
              <label>Banner Color</label>
              <div className="relative my-2 flex flex-wrap">
                {colorOptions.map((option, index) => (
                  <div key={index} onClick={() => handleColorChange(option)} className={`w-8 h-8 cursor-pointer rounded-full bg-${colorToClassName(option)} mr-2 mb-2 ${formData.color === option ? 'outline outline-2 outline-offset-2 outline-darkgrey' : ''}`}></div>
                ))}
              </div>
              <div className="relative my-2">
                <label>Description</label>
                
                
                <FormField name='description' required={true} type="textarea" value={formData.description} onChange={handleChange} error={errors?.description?._errors[0]} label="Description" />
              </div>
              <Button type="submit"  onClick={handleSubmit} placeholder='Save' className="bg-red">Save Challenge</Button>
            </div>
          </Form>
          )
  }



