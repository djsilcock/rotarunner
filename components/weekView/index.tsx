/* eslint-disable react/prop-types */
import React from "react";
import { observer } from "mobx-react-lite";
import classnames from "classnames/bind";
import { addDays, addHours, isSameDay, startOfWeek } from "date-fns";
import { useStyles } from "./useStyles";
import { DutyCell } from "./DutyCell";
import { SettingsContext } from "../context";
import { DndContext } from "@dnd-kit/core";
import { useDispatchAction } from "../useDispatchAction";
import { DataWrapper } from "./datawrapper";

function WeekViewInner({ viewDate }) {
  const dispatch=useDispatchAction()
  const {theatreNames} = React.useContext(SettingsContext)
  const classNames = useStyles();
  const cn = classnames.bind(classNames);
  viewDate = isNaN(viewDate) ? new Date() : viewDate ?? new Date();
  const daysOfWeek = React.useMemo(() => {
    const monday8AM = addHours(startOfWeek(viewDate, { weekStartsOn: 1 }), 8)
    return [0, 1, 2, 3, 4, 5, 6].map(i => addDays(monday8AM, i))
  }, [viewDate]);
  const handleDragEnd = React.useCallback((evt) => {
    console.log(evt)
    if (evt.over?.id) dispatch({ type: 'drag', from: evt.active, to: evt.over })
  }
  ,[dispatch])
  return (
    
    <DndContext onDragEnd={handleDragEnd}>
      <div onContextMenu={(...e)=>console.log(e)}>
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
            {Array.from(theatreNames.entries(),([shortName, theatreName]) => (
              <tr key={shortName}>
                <td className={classNames.dutyCell}>
                  <div>{theatreName}</div>
                </td>
                {daysOfWeek.map((day, i) => (
                  <DutyCell
                    key={i}
                    dutyDay={day}
                    location={shortName}
  
                  />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </DndContext>
    
  );
}
export default observer(function WeekView(props:{viewDate}) {
  return <DataWrapper><WeekViewInner {...props}/></DataWrapper>
});
