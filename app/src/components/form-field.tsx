// app/components/form-field.tsx
import { useEffect, useState } from "react"

interface FormFieldProps {
  htmlFor: string
  label: string
  type?: string
  value: any
  onChange?: (...args: any) => any
  error?: string
}

export function FormField({
  htmlFor,
  label,
  type = "text",
  value,
  onChange = () => { },
  error = ""
}: FormFieldProps) {
  const [errorText, setErrorText] = useState(error)
  useEffect(() => {
      setErrorText(error)
  }, [error])
  return <>
      <label htmlFor={htmlFor} className="text-blue-600 font-semibold">{label}</label>
      <input onChange={e => {
          onChange(e)
          setErrorText('')
      }} type={type} id={htmlFor} name={htmlFor} className="w-full p-2 rounded-xl my-2" value={value} />
      {errorText &&
        <div className="text-xs font-semibold text-left tracking-wide text-red w-full mb-4">
            {errorText || ''}
        </div>
      }
  </>
}