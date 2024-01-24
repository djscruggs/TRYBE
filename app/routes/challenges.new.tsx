
import { Form } from "@remix-run/react";
import { useState } from "react";
import z from 'zod'
import { format } from "date-fns";

import DatePicker from '../components/datepicker'
export default function NewChallenge({ children }: { children: React.ReactNode }) {
  
  const Challenge = z.object({
    id: z.bigint(),
    name: z.string()
          .min(5, { message: "Must be 5 or more characters long" })
          .max(50, { message: "Must be 50 or fewer characters long" }),
    description: z.string(),
    startAt: z.date({required_error: "Please select a date"})
            .min(new Date(), { message: "Must start today or after" }),
    endAt: z.date().min(new Date(), { message: "Must start today or after" }),
    frequency: z.enum(
      ["DAILY",
      "WEEKDAYS",
      "ALTERNATING",
      "WEEKLY",
      "CUSTOM"]
    ),
    converPhoto: z.string(),
    icon: z.string(),
    color: z.string(),
    reminders: z.boolean(),
    syncCalendar: z.boolean(),
    publishAt: z.date(),
    published: z.boolean(),
    userId: z.bigint()
  });
  
  
  
  return  (
          <>
            <h1>
              I am a new challenge form
            </h1>
            <div className="relative">
            <Form method="post">
            <DatePicker />
       

            
            
   

            </Form>
          </div>
          </>
          )
  }