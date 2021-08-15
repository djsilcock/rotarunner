import { createContext } from "react"
interface ISettingsContext {
  editMode: boolean
}

export const SettingsContext = createContext<ISettingsContext>({ editMode: false })
export const DataContext = createContext(null)
