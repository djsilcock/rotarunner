import React,{ReactElement} from 'react'
import { useState } from 'react'
import { useCallback } from 'react'
import { PopupDialog, PopupDialogState } from '../PopupDialog'
import { PopupMenu,PopupMenuState } from '../PopupMenu'
import { DataContext, SettingsContext } from '../context'
import { dispatchAction } from '../../lib/datalayer'

interface DataWrapperProps{
    children:ReactElement
}
export function DataWrapper({children }:DataWrapperProps):JSX.Element {
    const [contextMenuState, setContextMenuState] = useState<PopupMenuState>({ anchorEl: null, options: [], callback: null })
    const [popupDialogState, setPopupDialogState] = useState<PopupDialogState>({ content: null, title: null, callback: null })
    const requestContextMenu = useCallback(function requestContextMenu(anchorEl: HTMLElement, options: [[id: string, text: string]]) {
        return new Promise((resolve, reject) => {
            const callback = (err, value) => {
                setContextMenuState({ anchorEl: null, options: [], callback: null })
                if (err) reject(err)
                resolve(value)
            }
            setContextMenuState({ anchorEl, options, callback })
        })
    }, [setContextMenuState])
    const requestPopupDialog = useCallback(function requestPopupDialog(title:string,content:ReactElement) {
        return new Promise((resolve, reject) => {
            const callback = (err, value) => {
                setPopupDialogState({ title: null, content:null, callback: null })
                if (err) reject(err)
                resolve(value)
            }
            setPopupDialogState({ title,content, callback })
        })
    }, [setPopupDialogState])
    const dispatchFunction = React.useCallback(function dispatchFunction(action) {
        console.log('dispatching...',action,requestPopupDialog,requestContextMenu)
        dispatchAction(action,{requestPopupDialog,requestContextMenu})
    },[dispatchAction,requestPopupDialog,requestContextMenu])
    return (
        <DataContext.Provider value={{ requestContextMenu, requestPopupDialog, dispatchFunction }}>
            <PopupDialog state={popupDialogState} />
            <PopupMenu state={contextMenuState}/>
            {children}
        </DataContext.Provider>
    )
}