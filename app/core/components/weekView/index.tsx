/* eslint-disable react/prop-types */
import React, { Suspense } from "react"
import { addDays, addHours, isSameDay, startOfWeek, formatISO } from "date-fns"
import { styles } from "./useStyles"
import { DutyCell } from "./DutyCell"
import { SettingsContext } from "../context"
import { DndContext } from "@dnd-kit/core"
import { useDispatchAction } from "../useDispatchAction"
import { DataWrapper } from "./datawrapper"
import { useQuery } from "blitz"
import getTheatres from "./queries/getTheatres"
import { Table, TableHead, TableRow, TableCell, TableBody } from "@material-ui/core"
import getListsForWeek from "./queries/getListsForWeek"

function WeekViewInner({ viewDate }) {
  const dispatch = useDispatchAction()
  //const { theatreNames } = React.useContext(SettingsContext)
  const [theatreNames] = useQuery(getTheatres, { staleTime: 600000 })
  const [theatreLists] = useQuery(getListsForWeek, {
    day: formatISO(startOfWeek(viewDate)).slice(0, 10),
  })
  //const classNames = useStyles();
  //const cn = classnames.bind(classNames);
  viewDate = isNaN(viewDate) ? new Date() : viewDate ?? new Date()
  const daysOfWeek = React.useMemo(() => {
    const monday = startOfWeek(viewDate, { weekStartsOn: 1 })
    return [0, 1, 2, 3, 4, 5, 6].map((i) => {
      const day = addDays(monday, i)
      return { day, tag: formatISO(day).slice(0, 10), verbose: day.toDateString() }
    })
  }, [viewDate])
  const handleDragEnd = React.useCallback(
    (evt) => {
      console.log(evt)
      if (evt.over?.id) dispatch({ type: "drag", from: evt.active, to: evt.over })
    },
    [dispatch]
  )
  console.log("weekview rendering")
  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div onContextMenu={(...e) => console.log(e)}>
        <Table
          sx={{
            backgroundColor: "theme.palette.divider",
            width: "100%",
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell />

              {daysOfWeek.map((day, i) => (
                <TableCell
                  key={i}
                  sx={{
                    fontFamily: "Gill Sans, Gill Sans MT, Calibri, Trebuchet MS, sans-serif",
                    fontWeight: isSameDay(day.day, Date.now()) ? "bold" : undefined,
                    textAlign: "center",
                  }}
                >
                  {day.verbose}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {theatreNames.map(([shortName, theatreName]: [string, string]) => (
              <TableRow key={shortName}>
                <TableCell>
                  <div>{theatreName}</div>
                </TableCell>
                {daysOfWeek.map((day, i) => (
                  <DutyCell
                    key={i}
                    dutyDay={day.tag}
                    location={shortName}
                    theatreLists={theatreLists}
                  />
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </DndContext>
  )
}
export default function WeekView(props: { viewDate }) {
  return (
    <DataWrapper>
      <WeekViewInner {...props} />
    </DataWrapper>
  )
}
