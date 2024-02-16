
import { 
  useState, 
  useEffect,
  ChangeEvent, 
} from 'react';
import { Form } from "@remix-run/react";
import { useNavigate } from '@remix-run/react';
import type {ObjectData} from '~/utils/types.server'
import { Button, Select, Option } from "@material-tailwind/react";
import { FormField } from "~/components/form-field";
import DatePicker from "react-datepicker";
import { CurrentUserContext } from '../utils/CurrentUserContext';
import { useContext } from "react";
import { toast } from 'react-hot-toast';
import axios from 'axios'







export default function FormChallenge(props:ObjectData) {
  const frequencies = ["DAILY","WEEKDAYS","ALTERNATING","WEEKLY","CUSTOM"]
  
  const navigate = useNavigate()
  const [errors, setErrors] = useState(props.errors);
  const [formData, setFormData] = useState(props.object)
  const {currentUser} = useContext(CurrentUserContext)
  useEffect(() => {
      setFormData(props.object)
      setErrors(props.errors)
  }, [props])

  function selectDate(name:string, value:Date) {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  }
  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };
  function handleSelect(value: string | undefined){
    setFormData((prevFormData) => ({
      ...prevFormData,
      ['frequency']: value,
    }));
  }
  async function handleSubmit(event: any){
    event.preventDefault()
    const url = '/api/challenges'
    const headers = {headers: {
      'content-type': 'multipart/form-data'
    }}
    let response;
    let msg;
    if(formData.id){
      response = await axios.post(url, formData, headers);
      msg = 'Challenge saved';
    } else {
      response = await axios.put(url, formData, headers);
      msg = 'Challenge created';
    }
    console.log(response)
    if(response.data.errors){
      console.log('errors', response.data.errors)
      setErrors(response.data.errors)
      setFormData(response.data.formData)
    } else {
      toast.success(msg)
      navigate(`/challenges/${response.data.id}`)
    }
  }
  
  return  (
          <Form method="post" onSubmit={handleSubmit}>
            <input type="hidden" name="userId"  value={currentUser?.id} />
            <div className="relative max-w-sm">
              <div className="relative mb-2">
            <FormField name='name' required={true} value={formData.name} onChange={handleChange} error={errors?.name?._errors[0]} label="Name of Challenge" />
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
              <div className="relative my-2">
                <FormField name='description' required={true} type="textarea" value={formData.description} onChange={handleChange} error={errors?.description?._errors[0]} label="Description" />
              </div>
              <Button type="submit"  onClick={handleSubmit} placeholder='Save' className="bg-red">Save Challenge</Button>
            </div>
          </Form>
          )
  }