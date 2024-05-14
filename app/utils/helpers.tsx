import React from 'react'
// icons
import { GiShinyApple, GiMeditation } from 'react-icons/gi'
import { FaRegLightbulb } from 'react-icons/fa6'
import { RiMentalHealthLine } from 'react-icons/ri'
import { PiBarbellLight } from 'react-icons/pi'
import { IoFishOutline } from 'react-icons/io5'
import type { ChangeEvent } from 'react'
import { toast } from 'react-hot-toast'
import { type CurrentUser } from './types'

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
    if (typeof obj[key] === 'object') {
      result[key] = obj[key]
    } else if (obj[key] === 'true' || obj[key] === 'false') {
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

export function colorToClassName (color: string, defaultColor: string): string {
  if (!color) return defaultColor
  const lower = color.toLowerCase()
  const colorMap: Record<string, string> = {
    red: 'red',
    salmon: 'salmon',
    orange: 'orange-500',
    yellow: 'yellow',
    green: 'green-500',
    blue: 'blue',
    // pink: 'pink-300',
    purple: 'purple-400'
  }
  const baseColor = lower.split('-')[0]
  return colorMap[baseColor]
}
export function buttonColorFromContainer (containerColor: string | undefined, defaultColor: string): string {
  if (!containerColor) return defaultColor
  const containerColorLower = containerColor.toLowerCase()
  if (['red'].includes(containerColorLower)) {
    return 'gray-200'
  } else {
    return 'red'
  }
}
export function userLocale (user: CurrentUser | null | undefined): string {
  return user?.locale ?? window.navigator.language ?? 'en-US'
}
export function textColorFromContainer (containerColor: string | undefined, defaultColor: string): string {
  if (!containerColor) return defaultColor
  const containerColorLower = containerColor.toLowerCase()
  if (['red', 'blue', 'purple', 'green', 'orange', 'pink'].includes(containerColorLower)) {
    return 'white'
  } else if (['salmon', 'yellow'].includes(containerColorLower)) {
    return '#9D4D41'
  } else {
    return 'white'
  }
}

export function iconStyle (color: string | undefined): string {
  const bgColor = colorToClassName(color, 'red')
  const textColor = ['yellow'].includes(bgColor) ? 'black' : 'white'
  return `h-12 w-12 text-${textColor} bg-${bgColor} rounded-full p-2`
}

// taken from https://stackoverflow.com/questions/11381673/detecting-a-mobile-browser
export function isMobileDevice (): boolean {
  let check = false;
  (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true })(navigator.userAgent || navigator.vendor || window.opera)
  return check
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

export function convertlineTextToJSX (text: string | undefined): React.ReactNode {
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
export function textToHtml (text): string {
  return text.split('\n').map(line => `<p style="margin-bottom:.5em">${line}</p>`).join('').replace(/\n|\r/g, '')
}

interface HandleFileUploadProps {
  event: ChangeEvent<HTMLInputElement> // event that triggers the file upload
  setFile: (file: File | null) => void // callback that sets the file in the component's state
  setFileURL?: (dataURL: string | null) => void // callback that sets the file's URL in the component's state
}
export function handleFileUpload ({ event, setFile, setFileURL }: HandleFileUploadProps): void {
  const { files } = event.target
  if (!files) return
  const file: File = files[0]
  if (file.size > 20_000_000) {
    toast.error('File size must be less than 20MB')
    return
  }
  setFile(file)
  const fileReader = new FileReader()
  fileReader.onload = (e) => {
    const result = fileReader.result
    if (setFileURL) {
      if (result) {
        if (typeof result === 'string') {
          setFileURL(result)
        } else {
          setFileURL(null)
        }
      }
    }
  }
  fileReader.readAsDataURL(file)
}
