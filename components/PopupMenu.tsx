import React from "react";
import { Menu, MenuItem } from "@material-ui/core";
import { observer } from "mobx-react-lite";

export interface PopupMenuState{
  anchorEl: HTMLElement
  callback: (error: string, returnVal: string) => void
  options:[string,string][]
}

export const PopupMenu = observer(function PopupMenu({state}:{state:PopupMenuState}) {
  const anchorEl =state.anchorEl;
  const options=state.options
  const handleClose = (value:string) => () => {
    state.callback?.(null,value);
  };
  return (
    <div>
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose(null)}
      >
        {options.map(([code, text]) => <MenuItem key={code} onClick={handleClose(code)}>{text}</MenuItem>)}
       </Menu>
    </div>
  );
})
