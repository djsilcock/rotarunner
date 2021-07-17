import { createContext} from "react";
interface ISettingsContext{
    editMode: boolean;
    getListsForTheatreDay: (day: Date, location: string) => unknown[]
    
}

export const SettingsContext = createContext<ISettingsContext>(null)
export const DataContext = createContext(null)
