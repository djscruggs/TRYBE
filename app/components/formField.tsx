// app/components/form-field.tsx
import React, { useEffect, useState, useRef } from 'react'
import ShowPasswordButton from './showPasswordButton'

interface FormFieldProps {
  name: string
  label?: string
  placeholder?: string
  type?: string
  value?: any
  onChange?: (...args: any) => any
  onKeyDown?: (...args: any) => any
  error?: string
  required?: boolean
  autoComplete?: string
  autoFocus?: boolean
  autoResize?: boolean
  rows?: number
  cols?: number
}

export function FormField ({
  name,
  placeholder = '',
  label = '',
  type = 'text',
  value = '',
  onChange = () => { },
  onKeyDown = () => { },
  error = '',
  required = false,
  autoComplete = '',
  autoFocus = false,
  cols = 30,
  rows = 10

}: FormFieldProps): JSX.Element {
  const [errorText, setErrorText] = useState(error)
  useEffect(() => {
    setErrorText(error)
  }, [error])
  const [passwordVisible, setPasswordVisible] = useState(false)
  let localType = type // flag to track wheter password has been set visible
  if (type === 'password' && passwordVisible) {
    localType = 'text'
  }
  const textRef = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    if (textRef.current) {
      textRef.current.style.height = `${rows}rem`
      const scrollHeight = textRef.current.scrollHeight
      textRef.current.style.height = scrollHeight + 'px'
    }
  }, [value])
  return <>
      <label htmlFor={name} className="block text-blue-600">{label}</label>
      {localType === 'textarea'
        ? (
        <textarea
            onChange={(e) => {
              onChange(e)
              setErrorText('')
            }}
            id={name}
            name={name}
            placeholder={placeholder}
            className={`w-full p-2 rounded-sm my-1 border ${(errorText.length > 0) ? ' border-red' : ''}`}
            cols={cols}
            rows={rows}
            value={value}
            onKeyDown={onKeyDown}
            autoComplete={autoComplete}
            required={required}
            autoFocus = {autoFocus}
            maxLength={65535}
            ref={textRef}
          >
          {value}
        </textarea>
          )
        : (
      <input
          onChange={e => {
            onChange(e)
            setErrorText('')
          }}
          type={localType}
          id={name}
          name={name}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          required={required}
          className={`w-full p-2 rounded-md my-1 border ${(errorText.length > 0) ? ' border-red' : ''}`}
          value={value}
          autoComplete={autoComplete}
          autoFocus = {autoFocus}
      />

          )}

      {type === 'password' &&
        <ShowPasswordButton passwordVisible={passwordVisible} clickHandler={() => { setPasswordVisible(!passwordVisible) }} />
      }
      {(errorText.length > 0) &&
        <div className="text-xs font-semibold text-left tracking-wide text-red w-full mb-4 ">
            {errorText}
        </div>
      }
  </>
}
