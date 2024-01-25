
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
import { Input } from "@material-tailwind/react";
import { useActionData } from "@remix-run/react";
import { Button } from "@material-tailwind/react";
import { FormField } from "~/components/form-field";
import DatePicker from "react-datepicker";


const schema =  z.object({
                  name: z
                    .string()
                    .min(1, { message: "Challenge name is required" }),
                  description: z
                    .string()
                    .min(1, { message: "Description is required" }),
                  startAt: z.date({required_error: "Please select a date"})
                          .min(new Date(), { message: "Must start today or after" }),
                  frequency: z.enum(
                    ["DAILY",
                    "WEEKDAYS",
                    "ALTERNATING",
                    "WEEKLY",
                    "CUSTOM"]
                  ),
                  coverPhoto: z.string(),
                  icon: z.string(),
                  color: z.string(),
                  reminders: z.boolean(),
                  syncCalendar: z.boolean(),
                  publishAt: z.date(),
                  published: z.boolean(),
                  userId: z.bigint()

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
  const formData = await request.formData();
  const errors = {};
  try {
    const result = schema.safeParse(formData)
    if (!result.success) {
      return({
        formData,
        error: result.error.format()
      })
    }
    
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
  error?: ErrorObject;
  formData?: FormData;
};
export default function NewChallenge({ children }: { children: React.ReactNode }) {
  
  const data: Data = useActionData() ?? {};
  console.log(data)
  const [errors, setErrors] = useState<ErrorObject>(data.error || {});
  
  const defaults = getDefaults(schema)
  // console.log(defaults)
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
  
  console.log(errors)
  return  (
          <>
          <Form method="post">
            
            <div className="relative max-w-sm">
            
            <div className="relative ">
              <FormField name='name' value={formData.name} onChange={handleChange} error={errors?.name?._errors[0]} label="Name of Challenge" />
            </div>
            <div className="relative flex space-x-4">
              <div className="relative max-w-[200px]">
              <label>Start Date</label>
              <DatePicker className='p-1 border border-slate-gray-500 rounded-md' selected={formData.startAt} onChange={(date:Date) => selectDate('startAt', date)} />
              
              </div>
              <div className="relative max-w-[200px]">
              <label>End Date</label>
              <DatePicker className='p-1 border border-slate-gray-500 rounded-md'  selected={formData.endAt} onChange={(date:Date) => selectDate('endAt', date)} />
              </div>
            </div>
            <div className="relative mt-4">
              <FormField name='description' type="textarea" value={formData.description} onChange={handleChange} error={errors?.description?._errors[0]} label="Description" />
            </div>
            <Button type="submit" placeholder='Save' className="bg-red">Save Challenge</Button>
            
            
   

            
          </div>
          </Form>
          </>
          )
  }