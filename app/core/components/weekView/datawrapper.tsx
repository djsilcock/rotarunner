import React, { ReactElement, Suspense, MutableRefObject } from "react"
import { useState } from "react"
import { PopupMenu, PopupMenuState } from "../PopupMenu"
import { DataContext, SettingsContext } from "../context"
import { ListChangeForm } from "./requestListSpecChangeForm"
import { invalidateQuery, invoke, setQueryData, useMutation } from "blitz"
import modifyListMutation from "./mutations/modifyList"
import getListsForTheatreDay from "./queries/getListsForTheatreDay"
import getListsForWeek from "./queries/getListsForWeek"
import { TheatreList, StaffDuty } from "db"
import modifyList from "./mutations/modifyList"
import modifyDuty from "./mutations/modifyDuty"
import { ActionTypes } from "./ActionTypes"

interface DataWrapperProps {
  children: ReactElement
}

const contextMenus = {
  list: [
    [ActionTypes.requestListChange, "Modify list..."],
    [ActionTypes.requestListSplit, "Split/Clone..."],
    [ActionTypes.requestAddPeople, "Add people..."],
    [ActionTypes.requestDeleteList, "Delete list"],
  ],
  duty: [
    [ActionTypes.requestRemovePerson, "Remove from list"],
    [ActionTypes.requestChangeDutyTime, "Change duty time"],
  ],
  vacant: [[ActionTypes.requestNewList, "Add new list..."]],
}

interface DraggedTheatreList {
  type: "list"
  list: TheatreList
}
interface DraggedDuty {
  type: "duty"
  duty: StaffDuty
}
interface DropEmpty {
  type: "vacant"
  day: string
  theatreId: string
}
interface DragAction {
  from: { data: MutableRefObject<DraggedTheatreList | DraggedDuty> }
  to: { data: MutableRefObject<DraggedTheatreList | DropEmpty> }
}

async function updateDuty(duty: StaffDuty, changes: Partial<StaffDuty>) {
  console.log(await invoke(modifyDuty, { duty, action: "modify", changes }))
  console.log(duty)
  invalidateQuery(getListsForWeek)
}
async function updateList(list: TheatreList, updates: Partial<TheatreList>) {
  console.log(list, updates)
  console.log(await invoke(modifyList, { list, action: "modify", changes: updates }))
  if (updates.day || updates.theatreId) {
    invalidateQuery(getListsForWeek)
  }
  invalidateQuery(getListsForWeek)
}

function handleDragAction(action: DragAction) {
  const from = action.from.data.current
  const to = action.to.data.current
  console.log(from, to)
  if (from.type == "duty" && to.type == "list") {
    updateDuty(from.duty, { listId: to.list.id })
    return
  }
  if (from.type == "list" && to.type == "list") {
    updateList(from.list, {
      day: to.list.day,
      theatreId: to.list.theatreId,
    })
    return
  }
  if (from.type == "list" && to.type == "vacant") {
    updateList(from.list, {
      day: to.list.day,
      theatreId: to.list.theatreId,
    })
    return
  }
}
async function deleteList(list: TheatreList) {
  console.log("delete list")
  const { id, theatreId, day } = list

  await invoke(modifyListMutation, { list, action: "delete" })
  invalidateQuery(getListsForWeek)
}
async function cloneList(list: TheatreList) {
  console.log("clone list")
  const { id, theatreId, day } = list

  await invoke(modifyListMutation, { list, action: "clone" })
  invalidateQuery(getListsForWeek)
}

export function DataWrapper({ children }: DataWrapperProps): JSX.Element {
  const [contextMenuState, setContextMenuState] = useState<PopupMenuState>({
    anchorEl: null,
    options: [],
    callback: null,
  })
  const [popupDialogState, setPopupDialogState] = useState<{
    content
    initialValues
    onSubmit
    onError
  } | null>(null)
  const [listChangePopupState, setListChangePopupState] = useState(null)

  function requestContextMenu(anchorEl: HTMLElement, options: [[id: string, text: string]]) {
    return new Promise((resolve, reject) => {
      const callback = (err, value) => {
        setContextMenuState({ anchorEl: null, options: [], callback: null })
        if (err) reject(err)
        resolve(value)
      }
      setContextMenuState({ anchorEl, options, callback })
    })
  }

  function requestPopupDialog<V>(content: ReactElement, initialValues: V): Promise<V> {
    return new Promise((onSubmit: (value: V) => void, onError) => {
      setPopupDialogState({ content, initialValues, onSubmit, onError })
    }).finally(() => setPopupDialogState(null))
  }

  function dispatchFunction(action) {
    console.log("dispatching...", action, requestPopupDialog, requestContextMenu)
    dispatchAction(action)
  }

  function dispatchAction(action) {
    switch (action.type) {
      case "unknown":
        console.log("unknown action", action)
        break
      case "drag":
        handleDragAction(action)
        break
      case ActionTypes.requestDeleteList:
        deleteList(action.list)
        break
      case ActionTypes.requestListSplit:
        cloneList(action.list)
        break
      case ActionTypes.requestListChange:
        setListChangePopupState(action.list)
        break
      case ActionTypes.requestNewList:
        setListChangePopupState(action.list)
        break
      case "contextmenu":
        handleContextMenu(action)
        break
      default:
        console.log("unknown action", action)
    }
  }
  function handleContextMenu(action) {
    const anchorEl = action.ref.current
    requestContextMenu(anchorEl, contextMenus[action.celldata.type]).then((menu) => {
      dispatchAction({ ...action, ...action.celldata, type: menu })
    })
  }
  console.log("re-rendering datawrapper")
  return (
    <DataContext.Provider value={{ requestContextMenu, requestPopupDialog, dispatchFunction }}>
      <Suspense fallback="loading...">
        <Suspense fallback="loading popup">
          <ListChangeForm listToChange={listChangePopupState} resetList={setListChangePopupState} />
        </Suspense>
        <PopupMenu state={contextMenuState} />
        <Suspense fallback="loading weekview">{children}</Suspense>
      </Suspense>
    </DataContext.Provider>
  )
}
