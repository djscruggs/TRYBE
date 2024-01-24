// app/components/form-field.tsx
import { useEffect, useState } from "react"
import ShowPasswordButton from './show-password-button';

interface FormFieldProps {
  htmlFor: string
  label: string
  type?: string
  value: any
  onChange?: (...args: any) => any
  error?: string
  autoComplete?: string
  autoFocus?: boolean
}

export function FormField({
  htmlFor,
  label,
  type = "text",
  value,
  onChange = () => { },
  error = "",
  autoComplete="",
  autoFocus = false

}: FormFieldProps) {
  
  
  const [errorText, setErrorText] = useState(error)
  useEffect(() => {
      setErrorText(error)
  }, [error])
  const [passwordVisible, setPasswordVisible] = useState(false)
  let localType = type //flag to track wheter password has been set visible
  if(type == 'password' && passwordVisible){
    localType='text'
  }
  
  function togglePasswordVisibility() {
    setPasswordVisible((prevState) => !prevState);
  }
  return <>
      <label htmlFor={htmlFor} className="text-blue-600 font-semibold">{label}</label>
      <input 
          onChange={e => {
                        onChange(e)
                        setErrorText('')
                    }} 
          type={localType} 
          id={htmlFor} 
          name={htmlFor} 
          className={`w-full p-2 px-4 rounded-full my-2 ${errorText ? 'border border-2 border-red' : ''}`}
          value={value} 
          autoComplete={autoComplete}
          autoFocus = {autoFocus}
      />
      {type == 'password' &&
        <ShowPasswordButton passwordVisible={passwordVisible} clickHandler={togglePasswordVisibility} />
      }
      {errorText &&
        <div className="text-xs font-semibold text-left tracking-wide text-red w-full mb-4 ml-4">
            {errorText || ''}
        </div>
      }
  </>
}