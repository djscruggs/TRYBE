import { createContext, useContext } from 'react'

interface DeviceContextType {
  isMobileDevice: boolean
  isIphone: boolean
  isAndroid: boolean
  isMobile: () => boolean
}

const DeviceContext = createContext<DeviceContextType>({
  isMobileDevice: false,
  isIphone: false,
  isAndroid: false,
  isMobile: (): boolean => false
})

export const useDeviceContext = (): DeviceContextType =>
  useContext(DeviceContext)

export default DeviceContext
