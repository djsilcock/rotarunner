import React from "react"
import { Menu, MenuItem } from "@material-ui/core"
import { observer } from "mobx-react-lite"

interface PopupMenuStateContent {
  anchorEl: HTMLElement
  callback: (error: string | null, returnVal: string | null) => void
  options: [string, string][]
}
interface PopupMenuStateNull {
  anchorEl: null
  callback: null
  options: []
}

export type PopupMenuState = PopupMenuStateContent | PopupMenuStateNull

export const PopupMenu = observer(function PopupMenu({ state }: { state: PopupMenuState }) {
  const anchorEl = state.anchorEl
  const options = state.options
  const handleClose = (value: string | null) => () => {
    state.callback?.(null, value)
  }
  return (
    <div>
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose(null)}
      >
        {options.map(([code, text]) => (
          <MenuItem key={code} onClick={handleClose(code)}>
            {text}
          </MenuItem>
        ))}
      </Menu>
    </div>
  )
})
