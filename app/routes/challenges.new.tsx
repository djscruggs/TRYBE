
import React, { 
  useState, 
  useEffect,
  ChangeEvent, 
  FormEvent
} from 'react';
import z from 'zod'
import { Form } from "@remix-run/react";
import type { ActionFunctionArgs } from "@remix-run/node"; // or cloudflare/deno
import { json, redirect } from "@remix-run/node"; // or cloudflare/deno

import { useActionData, useSubmit } from "@remix-run/react";
import {createChallenge} from '~/utils/challenge.server'
import type {ChallengeData} from '~/utils/types.server'
import { Button, Select, Option } from "@material-tailwind/react";
import { FormField } from "~/components/form-field";
import DatePicker from "react-datepicker";
import { CurrentUserContext } from '../utils/CurrentUserContext';
import { useContext } from "react";



const schema =  z.object({
                  name: z
                    .string()
                    .min(1, { message: "Challenge name is required" }),
                  description: z
                    .string()
                    .min(1, { message: "Description is required" }),
                  startAt: z.coerce.date({required_error: "Please select a date"})
                          .min(new Date(), { message: "Must start today or after" }),
                          
                          
                  endAt: z.coerce.date()
                          .or(z.literal('')).nullable(),
                          
                  frequency: z.enum(["DAILY","WEEKDAYS","ALTERNATING","WEEKLY","CUSTOM"]),
                  coverPhoto: z.string().optional(),
                  icon: z.string().optional(),
                  color: z.string().optional(),
                  reminders: z.boolean().default(false),
                  syncCalendar: z.boolean().default(false),
                  publishAt: z.date().optional(),
                  published: z.boolean().default(false),
                  userId: z.coerce.bigint()

  })

function getDefaults<Schema extends z.AnyZodObject>(schema: Schema) {
  return Object.fromEntries(
      Object.entries(schema.shape).map(([key, value]) => {
          if (value instanceof z.ZodDefault) return [key, value._def.defaultValue()]
          return [key, undefined]
      })
  )
}

export async function action({
  request,
}: ActionFunctionArgs) {
  
  const formData = Object.fromEntries(await request.formData());
  // console.log(formData)
  
  try {
    const validation = schema.safeParse(formData)
    if (!validation.success) {
      //additional check
      let errors = validation.error.format()
      // console.log(errors)
      return({
        formData,
        errors: errors
      })
    }
    const toSubmit = {userId: 1,
                      name: 'asdasd',
                      startAt: new Date('01/26/2024'),
                      endAt: null,
                      description: 'asdasdasd'}
    const data = await createChallenge(toSubmit as ChallengeData)
    console.log('result from prisma')
    console.log(data)
    return data
    
  } catch(error){
    return {
      formData,
      error
    }
  }
  return null
  
}
type ErrorObject = {
  [key: string]: {
    _errors: string[];
  };
};

type FormData = {
  [key: string]: string | number | boolean | Date | undefined;
  // Add other types as needed for the values
};
type Data = {
  errors?: ErrorObject;
  formData?: FormData;
};
export default function NewChallenge({ children }: { children: React.ReactNode }) {
  const frequencies = schema.shape.frequency._def.values
  const data: Data = useActionData() ?? {};
  const [errors, setErrors] = useState<ErrorObject>();
  useEffect(() => {
    setErrors(data.errors)
  }, [data]);
  const defaults = getDefaults(schema)
  const submit = useSubmit();
  const {currentUser} = useContext(CurrentUserContext)
  
  const [formData, setFormData] = useState(defaults)
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
    console.log('setting to ', value)
    setFormData((prevFormData) => ({
      ...prevFormData,
      ['frequency']: value,
    }));
  }
  
  
  
  return  (
          <>
          <Form method="post">
            <input type="hidden" name="userId"  value={currentUser?.id} />
            <div className="relative max-w-sm">
            
            <div className="relative mb-2">
              <FormField name='name' required={true} value={formData.name} onChange={handleChange} error={errors?.name?._errors[0]} label="Name of Challenge" />
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
              
              <DatePicker name='startAt' required={true} className='p-1 border border-slate-gray-500 rounded-md my-2 pl-2' selected={formData.startAt} onChange={(date:Date) => selectDate('startAt', date)} />
              {errors?.startAt && (
                <div className="text-xs font-semibold text-left tracking-wide text-red w-full mb-4">
                  {errors?.startAt._errors[0]}
                </div>
              )}
              </div>
              <div className="relative max-w-[200px]">
              <label>End Date</label>
              <DatePicker name='endAt' className='p-1 border border-slate-gray-500 rounded-md my-2 pl-2'  selected={formData.endAt} onChange={(date:Date) => selectDate('endAt', date)} />
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
            <Button type="submit"   placeholder='Save' className="bg-red">Save Challenge</Button>
            
            
   

            
          </div>
          </Form>
          </>
          )
  }