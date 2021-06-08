import React, { useContext } from "react";
import { observer } from "mobx-react-lite";
import classnames from "classnames/bind";
import { DutyProps } from "./types";
import { useStyles } from "./useStyles";
import { SettingsContext } from "../context";

export const Duty = observer(function Duty(props: DutyProps) {
  const {
    startTime,
    duration,
    staffName,
    staffLevel,
    staffGroup,
    openContextMenu,
  } = props;
  const classNames = useStyles();
  const settings = useContext(SettingsContext)
  const cn = classnames.bind(classNames);
  const ref = React.useRef(null);
  return (

    <div className={classNames.duty}
      draggable={settings.editMode}
      onDragStart={(e) => {
        e.dataTransfer.setData('application/myobj', JSON.stringify(props))
        e.dataTransfer.effectAllowed = 'move'
      }}
      ref={ref}
      title={`${staffName} - ${staffLevel}`}
      onContextMenu={(e) => {
        e.preventDefault()
        e.stopPropagation()
        openContextMenu(ref.current, props)
      }}>
      <span className={classNames.dutyTime}>
        {startTime}-{(startTime + duration)%24}
      </span>
      &nbsp;<span className={classNames[staffGroup]}>{staffName}</span>
      &nbsp;
      {staffLevel && (
        <span className={classNames.staffLevel}>{"(" + staffLevel + ")"}</span>
      )}
      
      <div className={classNames.timeIndicator}>
        <div
          className={classNames.offShift}
          style={{ flexGrow: Math.max(startTime - 8, 0) }}
        ></div>
        <div
          className={classNames.onShift}
          style={{ flexGrow: duration }}
        ></div>
        <div
          className={classNames.offShift}
          style={{ flexGrow: Math.max(24 - (startTime - 8) - duration, 0) }}
        ></div>
      </div>

    </div>
  );
});
