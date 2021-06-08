import React from "react";
import { Menu, MenuItem } from "@material-ui/core";

export function PopupMenu({ data, callback }) {
  const anchorEl = data.anchorEl;
  const handleClose = (value) => () => {
    callback(anchorEl, value);
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
        <MenuItem onClick={handleClose(null)}>{data.staffName ?? '(Unallocated)'}</MenuItem>
        <MenuItem onClick={handleClose('profile')}>Profile</MenuItem>
        <MenuItem onClick={handleClose('account')}>My account</MenuItem>
        <MenuItem onClick={handleClose('logout')}>Logout</MenuItem>
      </Menu>
    </div>
  );
}
