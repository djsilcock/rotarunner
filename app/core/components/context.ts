import { createContext } from "react"
interface ISettingsContext {
  editMode: boolean
}
interface IDataContext {
  requestPopupDialog
  requestContextMenu
  dispatchFunction
}

export const SettingsContext = createContext<ISettingsContext>({ editMode: false })
export const DataContext = createContext<Partial<IDataContext>>({})
