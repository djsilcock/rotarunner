/* eslint-disable react/prop-types */
import React from "react"
import { observer } from "mobx-react-lite"
import makeStyles from "@material-ui/styles/makeStyles"
import { addDays, eachWeekOfInterval, endOfMonth, isSameMonth, startOfMonth } from "date-fns"

const useStyles = makeStyles((theme) => ({
  monthView: {
    backgroundColor: theme.palette.divider,
    width: "100%",
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

  dateNumber: {
    fontSize: "x-small",
    color: theme.palette.text.primary,
  },
  otherMonthDateNumber: {
    fontSize: "x-small",
    color: theme.palette.text.disabled,
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
}))

const Duty = observer(function Duty({ startTime, finishTime, location }) {
  const classNames = useStyles()
  return (
    <div>
      <span className={classNames.dutyTime}>
        {startTime.getHours()}-{finishTime.getHours()}
      </span>
      &nbsp;<span>{location}</span>
    </div>
  )
})

const DutyCell = observer(function DutyCell({ startTime, viewDate, getDuties }) {
  const classNames = useStyles()
  const duties = getDuties(startTime)
  return (
    <td className={classNames.dutyCell}>
      <span
        className={
          isSameMonth(startTime, viewDate) ? classNames.dateNumber : classNames.otherMonthDateNumber
        }
      >
        {startTime.getDate()}
      </span>
      {duties.map((duty) => (
        <Duty key={duty.id} {...duty} />
      ))}
    </td>
  )
})
function MonthView({ viewDate, getDuties }) {
  const weeksInMonth = eachWeekOfInterval(
    { start: startOfMonth(viewDate), end: endOfMonth(viewDate) },
    { weekStartsOn: 1 }
  )

  const classNames = useStyles()
  viewDate = isNaN(viewDate) ? new Date() : viewDate ?? new Date()

  return (
    <table className={classNames.monthView}>
      <thead>
        <tr>
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <td key={day} className={classNames.weekday}>
              {day}
            </td>
          ))}
        </tr>
      </thead>
      <tbody>
        {weeksInMonth.map((week, i) => (
          <tr key={i}>
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <DutyCell
                key={i}
                startTime={addDays(week, i)}
                viewDate={viewDate}
                getDuties={getDuties}
              />
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
export default observer(MonthView)
