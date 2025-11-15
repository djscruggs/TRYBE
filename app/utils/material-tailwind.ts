// Material Tailwind React v3 wrapper to handle CommonJS imports properly
import * as pkg from '@material-tailwind/react'

// Export all components individually to avoid destructuring issues
export const Spinner = pkg.Spinner
export const Button = pkg.Button
export const Avatar = pkg.Avatar
export const Card = pkg.Card
export const CardHeader = pkg.CardHeader
export const CardBody = pkg.CardBody
export const CardFooter = pkg.CardFooter

// Dialog components - v3 structure
export const Dialog = pkg.Dialog
export const DialogRoot = pkg.DialogRoot
export const DialogContent = pkg.DialogContent
export const DialogOverlay = pkg.DialogOverlay
export const DialogTrigger = pkg.DialogTrigger
export const DialogDismissTrigger = pkg.DialogDismissTrigger

// Legacy aliases for backward compatibility
export const DialogHeader = pkg.DialogContent // DialogHeader is now DialogContent
export const DialogBody = pkg.DialogContent // DialogBody is now DialogContent
export const DialogFooter = pkg.DialogContent // DialogFooter is now DialogContent

// Menu components - v3 structure
export const Menu = pkg.Menu
export const MenuRoot = pkg.MenuRoot
export const MenuTrigger = pkg.MenuTrigger
export const MenuContent = pkg.MenuContent
export const MenuItem = pkg.MenuItem

// Legacy aliases for backward compatibility
export const MenuHandler = pkg.MenuTrigger // MenuHandler is now MenuTrigger
export const MenuList = pkg.MenuContent // MenuList is now MenuContent

// Select components - v3 structure
export const Select = pkg.Select
export const SelectRoot = pkg.SelectRoot
export const SelectTrigger = pkg.SelectTrigger
export const SelectList = pkg.SelectList
export const SelectOption = pkg.SelectOption

// Legacy aliases for backward compatibility
export const Option = pkg.SelectOption // Option is now SelectOption

// Other components
export const Radio = pkg.Radio
export const Checkbox = pkg.Checkbox
export const Tooltip = pkg.Tooltip
export const Drawer = pkg.Drawer
export const ThemeProvider = pkg.ThemeProvider

// Export the default for any other components
export default pkg
