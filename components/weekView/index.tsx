/* eslint-disable react/prop-types */
import React, { useContext } from "react";
import { observer } from "mobx-react-lite";
import classnames from "classnames/bind";
import { addDays, addHours, isSameDay, startOfWeek } from "date-fns";
import { ObservableGroupMap } from "mobx-utils";
import { getTagFromDuty } from "./getTagFromDuty";
import { useStyles } from "./useStyles";
import { DutyCell } from "./DutyCell";
import { PopupMenu } from "./PopupMenu";
import { SettingsContext } from "../context";

function WeekView({ viewDate, allDuties, theatreNames,modifyDuty }) {
  const classNames = useStyles();  
  const cn = classnames.bind(classNames);
  viewDate = isNaN(viewDate) ? new Date() : viewDate ?? new Date();
  const daysOfWeek = React.useMemo(() => {
    const monday8AM = addHours(startOfWeek(viewDate, { weekStartsOn: 1 }), 8)
    return [0, 1, 2, 3, 4, 5, 6].map(i => addDays(monday8AM, i))
  }, [viewDate]);
  const [dutyMap] = React.useState(() => new ObservableGroupMap(allDuties, getTagFromDuty))
  const [contextMenu, setContextMenu] = React.useState({ anchorEl: null })
  const openContextMenu = React.useCallback((anchorEl, data) => { setContextMenu({ anchorEl: document.activeElement, ...data }) }, [])
  return (
    <div>
      <PopupMenu data={contextMenu} callback={() => { setContextMenu((data) => ({ ...data, anchorEl: null })) }} />
      <table className={classNames.weekView}>
        <thead>
          <tr>
            <td className={classNames.weekday}></td>

            {daysOfWeek.map((day, i) => (
              <td
                key={i}
                className={cn({
                  weekday: true,
                  today: isSameDay(day, Date.now()),
                })}
              >
                {day.toDateString()}
              </td>
            ))}
          </tr>
        </thead>
        <tbody>
          {theatreNames.map(({ shortName, theatreName }) => (
            <tr key={shortName}>
              <td className={classNames.dutyCell}>
                <div>{theatreName}</div>
              </td>
              {daysOfWeek.map((day, i) => (
                <DutyCell
                  key={i}
                  dutyDay={day}
                  location={shortName}
                  dutyMap={dutyMap}
                  openContextMenu={openContextMenu}
                  modifyDuty={modifyDuty}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export default observer(WeekView);
