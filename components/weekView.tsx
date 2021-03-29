/* eslint-disable react/prop-types */
import React from "react";
import { observer } from "mobx-react-lite";
import { makeStyles } from "@material-ui/core";
import classnames from "classnames/bind";
import { addDays, addHours, isSameDay, startOfWeek } from "date-fns";
import { differenceInHours } from "date-fns/esm";

const useStyles = makeStyles((theme) => ({
  weekView: {
    backgroundColor: theme.palette.divider,
    width:'100%'
  },
  timeIndicator: {
    width: "100%",
    height: "2px",
    borderSpacing: 0,
    paddingTop: "2px",
    display: "flex",
  },
  onShift: {
    opacity: 0.8,
  },
  offShift: {
    opacity: 0.2,
  },

  dutyCell: {
    backgroundColor: theme.palette.background.default,

    fontFamily: "Gill Sans, Gill Sans MT, Calibri, Trebuchet MS, sans-serif",
    width: "12.5%",
  },

  core: {
    color: "green",
  },
  intermediate: {
    color: "orange",
  },
  higher: {
    color: "red",
  },

  dutyTime: {
    fontSize: "x-small",
    color: theme.palette.primary.dark,
  },
  staffLevel: {
    fontSize: "x-small",
    color: theme.palette.secondary.dark,
  },
  theatreDescription: {
    fontSize: "x-small",
    color: "red",
  },

  weekday: {
    fontFamily: "Gill Sans, Gill Sans MT, Calibri, Trebuchet MS, sans-serif",

    "&.today": {
      fontWeight: "bold",
    },
  },
}));

interface DutyProps{
  startTime:Date;
  finishTime:Date;
  staffName:string;
  dayStart:Date;
  staffLevel:string;
  staffGroup:string;
}
interface DutyCellProps{
  startTime:Date;
  location:string;
  getDuties:(location:string,startTime:Date)=>any;
}

const Duty = observer(function Duty({
  startTime,
  finishTime,
  staffName,
  dayStart,
  staffLevel,
  staffGroup,
}:DutyProps) {
  const classNames = useStyles();
  const cn = classnames.bind(classNames);
  
  return (
    <div title={`${staffName} - ${staffLevel}`}>
      <div className={classNames.timeIndicator}>
        <div
          className={classNames.offShift}
          style={{ flexGrow: Math.max(0,differenceInHours(dayStart,startTime))}}
        ></div>
        <div
          className={classNames.onShift}
          style={{ flexGrow: differenceInHours(startTime,finishTime)}}
        ></div>
        <div
          className={classNames.offShift}
          style={{ flexGrow: Math.max(differenceInHours(finishTime,addDays(dayStart,1)),0) }}
        ></div>
      </div>
      <span className={classNames.dutyTime}>
        {startTime.getHours()}-{finishTime.getHours()}
      </span>
      &nbsp;<span className={cn(staffGroup)}>{staffName}</span>
      &nbsp;
      {staffLevel && (
        <span className={classNames.staffLevel}>{"(" + staffLevel + ")"}</span>
      )}
    </div>
  );
});

const DutyCell = observer(function DutyCell({
  startTime,
  location,
  getDuties,
}:DutyCellProps) {
  const classNames = useStyles();

  const duties = React.useMemo(() => getDuties(location, startTime), [
    location,
    startTime,
  ]);

  return (
    <td className={classNames.dutyCell}>
      {duties.map((duty) => <Duty key={duty.id} dayStart={startTime} {...duty} />)}
    </td>
  );
});

function WeekView({ viewDate, getDuties, theatreNames }) {
  const classNames = useStyles();
  const cn = classnames.bind(classNames);
  viewDate = isNaN(viewDate) ? new Date() : viewDate ?? new Date();
  const daysOfWeek = React.useMemo(() => {
    
    const monday8AM = addHours(startOfWeek(viewDate,{weekStartsOn:1}),8)
    return [0,1,2,3,4,5,6].map(i=>addDays(monday8AM,i))
  }, [viewDate]);

  return (
    <table className={classNames.weekView}>
      <thead>
        <tr>
          <td className={classNames.weekday}></td>

          {daysOfWeek.map((day, i) => (
            <td
              key={i}
              className={cn({
                weekday: true,
                today: isSameDay(day,Date.now()),
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
                startTime={day}
                location={shortName}
                getDuties={getDuties}
              />
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
export default observer(WeekView);
