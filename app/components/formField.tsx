// app/components/form-field.tsx
import React, { useEffect, useState, useRef, JSX } from 'react'
import ShowPasswordButton from './showPasswordButton'

interface FormFieldProps {
  name: string
  label?: string
  placeholder?: string
  type?: string
  value?: any
  maxValue?: number
  minValue?: number
  onChange?: (...args: any) => any
  onKeyDown?: (...args: any) => any
  error?: string
  required?: boolean
  autoComplete?: string
  autoFocus?: boolean
  autoResize?: boolean
  rows?: number
  cols?: number
  disabled?: boolean
  inputRef?: React.RefObject<HTMLTextAreaElement | HTMLInputElement>
}

export function FormField ({
  name,
  placeholder = '',
  label = '',
  type = 'text',
  maxValue,
  minValue,
  value = '',
  onChange = () => { },
  onKeyDown = () => { },
  error = '',
  required = false,
  autoComplete = '',
  autoFocus = false,
  autoResize = false,
  cols = 30,
  rows = 10,
  disabled = false,
  inputRef

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
  const textRef = inputRef ?? useRef<HTMLTextAreaElement | HTMLInputElement | HTMLDivElement>(null)
  useEffect(() => {
    if (textRef.current && autoResize) {
      textRef.current.style.height = `${rows * 2}rem`
      let scrollHeight = textRef.current.scrollHeight
      if (scrollHeight > 10) {
        if (scrollHeight > 800) {
          scrollHeight = 800
        }
        textRef.current.style.height = scrollHeight + 'px'
      }
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
            className={`w-full p-2 rounded-sm my-1 border ${(errorText.length > 0) ? ' border-red' : ''} ${disabled ? 'bg-gray-50' : ''}`}
            cols={cols}
            rows={rows}
            value={value}
            onKeyDown={onKeyDown}
            autoComplete={autoComplete}
            required={required}
            autoFocus = {autoFocus}
            maxLength={65535}
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            disabled={disabled}
          />
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
          max={maxValue}
          min={minValue}
          autoComplete={autoComplete}
          autoFocus = {autoFocus}
          ref={inputRef as React.RefObject<HTMLInputElement>}
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
