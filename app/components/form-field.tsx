// app/components/form-field.tsx
import { useEffect, useState } from "react"
import ShowPasswordButton from './show-password-button';

interface FormFieldProps {
  name: string
  label?: string
  type?: string
  value?: any
  onChange?: (...args: any) => any
  error?: string
  required?: boolean
  autoComplete?: string
  autoFocus?: boolean
  rows?: number
  cols?: number
}

export function FormField({
  name,
  label,
  type = "text",
  value = '',
  onChange = () => { },
  error = "",
  required = false,
  autoComplete="",
  autoFocus = false,
  cols=30,
  rows=10

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
      <label htmlFor={name} className="text-blue-600">{label}</label>
      {localType === 'textarea' ? (
        <textarea 
          onChange={(e) => {
              onChange(e)
              setErrorText('')
              }} 

          id={name} 
          name={name} 
          className={`w-full p-2 px-4 rounded-sm my-2 border ${errorText ? ' border-red' : ''}`}
          cols={cols}
          rows={rows}
          value={value} 
          autoComplete={autoComplete}
          required={required}
          autoFocus = {autoFocus}
          maxLength={65535}
          >
          {value}
        </textarea>
      ): (
      <input 
          onChange={e => {
                        onChange(e)
                        setErrorText('')
                    }} 
          type={localType} 
          id={name} 
          name={name} 
          required={required}
          className={`w-full p-2 px-4 rounded-md my-2 border ${errorText ? ' border-red' : ''}`}
          value={value} 
          autoComplete={autoComplete}
          autoFocus = {autoFocus}
      />
      
      )}
      
      {type == 'password' &&
        <ShowPasswordButton passwordVisible={passwordVisible} clickHandler={togglePasswordVisibility} />
      }
      {errorText &&
        <div className="text-xs font-semibold text-left tracking-wide text-red w-full mb-4 ">
            {errorText || ''}
        </div>
      }
  </>
}