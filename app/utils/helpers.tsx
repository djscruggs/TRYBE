import React from 'react'
// icons
import { GiShinyApple, GiMeditation } from 'react-icons/gi'
import { FaRegLightbulb } from 'react-icons/fa6'
import { RiMentalHealthLine } from 'react-icons/ri'
import { PiBarbellLight } from 'react-icons/pi'
import { IoFishOutline } from 'react-icons/io5'
import type { ChangeEvent } from 'react'
import { toast } from 'react-hot-toast'

export const copyToClipboard = async (text: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text)
    toast.success('Link copied to clipboard')
  } catch (error) {
    toast.error('Error copying to clipboard')
    console.error(error)
  }
}
// helper  function that converts booleans, integers and dates from strings to the proper type
export function convertStringValues (obj: any): any {
  const result: any = {}
  for (const key in obj) {
    if (obj[key] === 'true' || obj[key] === 'false') {
      result[key] = obj[key] === 'true'
    } else if (String(obj[key]) === 'null') {
      result[key] = null
    } else if (!isNaN(obj[key] as number)) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const parsed = parseInt(obj[key])
      result[key] = isNaN(parsed) ? null : parsed
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    } else if (!isNaN(Date.parse(obj[key]))) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const date = new Date(obj[key])
      result[key] = date
    } else {
      result[key] = obj[key]
    }
  }
  return result
}

export function colorToClassName (color: string | undefined, defaultColor: string): string {
  if (!color) return defaultColor
  const lower = color.toLowerCase()
  const colorMap: Record<string, string> = {
    red: 'red',
    orange: 'orange-500',
    yellow: 'yellow',
    green: 'green-500',
    blue: 'blue',
    pink: 'pink-300',
    purple: 'purple-400'
  }
  const baseColor = lower.split('-')[0]
  return colorMap[baseColor]
}
export function buttonColorFromContainer (containerColor: string, defaultColor: string): string {
  if (!containerColor) return defaultColor
  const containerColorLower = containerColor.toLowerCase()
  if (['red'].includes(containerColorLower)) {
    return 'gray-200'
  } else {
    return 'red'
  }
}
export function textColorFromContainer (containerColor: string, defaultColor: string): string {
  if (!containerColor) return defaultColor
  const containerColorLower = containerColor.toLowerCase()
  if (['red', 'blue', 'purple', 'green', 'orange', 'pink'].includes(containerColorLower)) {
    return 'white'
  } else {
    return 'black'
  }
}

export function iconStyle (color: string): string {
  const bgColor = colorToClassName(color, 'red')
  const textColor = ['yellow'].includes(bgColor) ? 'black' : 'white'
  return `h-12 w-12 text-${textColor} bg-${bgColor} rounded-full p-2`
}

export const iconMap: Record<string, (color: string) => JSX.Element> = {
  GiShinyApple: (color: string) => <GiShinyApple className={iconStyle(color)} />,
  GiMeditation: (color: string) => <GiMeditation className={iconStyle(color)} />,
  FaRegLightbulb: (color: string) => <FaRegLightbulb className={iconStyle(color)} />,
  RiMentalHealthLine: (color: string) => <RiMentalHealthLine className={iconStyle(color)} />,
  PiBarbellLight: (color: string) => <PiBarbellLight className={iconStyle(color)} />,
  IoFishOutline: (color: string) => <IoFishOutline className={iconStyle(color)} />
}
export function getIconOptionsForColor (color: string): Record<string, JSX.Element> {
  const newIconOptions: Record<string, JSX.Element> = {}
  for (const key in iconMap) {
    if (Object.prototype.hasOwnProperty.call(iconMap, key)) {
      newIconOptions[key] = React.cloneElement(iconMap[key](color), { className: iconStyle(color) })
    }
  }
  return newIconOptions
}
export function iconToJsx (icon: string, color: string): React.ReactNode {
  const iconMap: Record<string, JSX.Element> = {
    GiShinyApple: <GiShinyApple className={iconStyle(color)} />,
    GiMeditation: <GiMeditation className={iconStyle(color)} />,
    FaRegLightbulb: <FaRegLightbulb className={iconStyle(color)} />,
    RiMentalHealthLine: <RiMentalHealthLine className={iconStyle(color)} />,
    PiBarbellLight: <PiBarbellLight className={iconStyle(color)} />,
    IoFishOutline: <IoFishOutline className={iconStyle(color)} />
  }
  let toUse: any
  if (!iconMap[icon]) {
    console.error('Icon not found. Submmitted: ' + icon + ', returning GiShinyApple')
    toUse = iconMap.GiShinyApple
  } else {
    toUse = iconMap[icon]
  }
  return <div className={iconStyle(color)}>{toUse}</div>
}

export function convertlineTextToHtml (text: string | undefined): React.ReactNode {
  if (!text) return null
  return (
    <div>
      {text.split('\n').map((line: string, index: number) => (
        <React.Fragment key={index}>
          {line}
          <br />
        </React.Fragment>
      ))}
    </div>
  )
}

export function handleImageUpload (
  e: ChangeEvent<HTMLInputElement>,
  setFile: (file: File | null) => void,
  setFileDataURL: (dataURL: string | null) => void): void {
  const { files } = e.target
  if (!files) return
  const image = files[0]
  if (image.size > 1_000_000) {
    toast.error('Image must be less than 1MB')
    return
  }
  setFile(image)
  const fileReader = new FileReader()
  fileReader.onload = (e) => {
    const result = e.target?.result
    if (result) {
      if (typeof result === 'string') {
        setFileDataURL(result)
      } else {
        setFileDataURL(null)
      }
    }
  }
  fileReader.readAsDataURL(image)
}
