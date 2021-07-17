import { useContext } from 'react';
import { DataContext } from './context';


export function useDispatchAction(): (action) => void {
    const dataContext = useContext(DataContext);
    if (!dataContext)
        throw 'useDispatchAction used outside of DataWrapper component';
    return dataContext.dispatchFunction;
}
