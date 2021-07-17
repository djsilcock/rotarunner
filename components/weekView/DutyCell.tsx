import React from "react";
import { observer } from "mobx-react-lite";
import { DutyList,EmptyDuty } from "./Duty";
import { useStyles } from "./useStyles";
import { SettingsContext } from "../context";


interface DutyCellProps{
  dutyDay: Date;
  location: string;
}

export const DutyCell = observer(function DutyCell(props: DutyCellProps) {
  const classNames = useStyles();
  const {
    dutyDay,
    location,
  } = props;
  const {getListsForTheatreDay}=React.useContext(SettingsContext)
  const lists = getListsForTheatreDay(dutyDay, location)
  const ref = React.useRef(null)
  return (
    <td
      tabIndex={0}
      ref={ref}
      className={classNames.dutyCell}
      data-target='hello'
      >
      {
        lists.length == 0 ? <EmptyDuty dutyDay={dutyDay} location={location} />: lists.map((list) => list&&<DutyList key={list.id} dutyList={list} />)
      }
      </td>
  );
});
