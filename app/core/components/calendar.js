import React from "react"
import classNames from "../styles/calendar.module.css"

export default function Calendar({ value, month, year }) {
  if (value) {
    value = new Date(value)
    month = month ?? value.getMonth() + 1
    year = year ?? value.getFullYear()
  }
  if (isNaN(month + year)) throw "Must supply valid date or month/year"
  const firstDayOfMonthWeekday = new Date(year, month - 1).getDay()
  const daysInPreviousMonth = new Date(year, month - 1, 0).getDate()
  const daysInThisMonth = new Date(year, month, 0).getDate()
  const endPaddingRequired = (7 - ((daysInThisMonth + firstDayOfMonthWeekday) % 7)) % 7

  return (
    <div className={classNames.calendar}>
      <div>S</div>
      <div>M</div>
      <div>Tu</div>
      <div>W</div>
      <div>Th</div>
      <div>F</div>
      <div>Sa</div>
      {Array.from(
        (function* () {
          for (
            let day = daysInPreviousMonth - firstDayOfMonthWeekday + 1;
            day <= daysInPreviousMonth;
            day++
          ) {
            yield <div className={classNames.otherMonthDay}>{day}</div>
          }
          for (let day = 1; day <= daysInThisMonth; day++) {
            yield <div className={classNames.thisMonthDay}>{day}</div>
          }
          for (let day = 1; day <= endPaddingRequired; day++) {
            yield <div className={classNames.otherMonthDay}>{day}</div>
          }
        })()
      )}
    </div>
  )
}
