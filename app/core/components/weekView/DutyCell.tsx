import React from "react"
import { DutyList, DutyListProps, EmptyDuty, EmptyDutyProps, TheatreListExt } from "./Duty"
import { SettingsContext } from "../context"
import { useQuery, useSession } from "blitz"
import getListsForTheatreDay from "./queries/getListsForTheatreDay"
import getSessionTypes from "./queries/getSessionTypes"
import { styles } from "./useStyles"
import { TableCell, Box, Alert } from "@material-ui/core"
import { TheatreList } from "db"

interface DutyCellProps {
  dutyDay: string
  location: string
  theatreLists: TheatreListExt[]
}

interface BaseDutyCellProps extends DutyCellProps {
  emptyDutyComponent: React.FC<EmptyDutyProps>
  dutyListComponent: React.FC<DutyListProps>
  getClashes: (lists: BaseDutyCellProps["theatreLists"], sessionTypes) => string[]
}

export function DutyCell(props: DutyCellProps) {
  const getClashes = React.useCallback(
    (lists, sessionTypes) =>
      lists.some((outerList) => {
        const sessionType = sessionTypes.find((s) => s.session.id == outerList.sessionTypeId)
        return lists.some((innerList) => {
          if (innerList === outerList) return false
          if (sessionType?.overlaps.includes(innerList.sessionTypeId)) return true
        })
      }),
    []
  )
  return (
    <BaseDutyCell
      emptyDutyComponent={EmptyDuty}
      dutyListComponent={DutyList}
      getClashes={getClashes}
      {...props}
    />
  )
}

function BaseDutyCell(props: BaseDutyCellProps) {
  const { dutyDay, location, theatreLists, getClashes } = props
  const EmptyDuty = props.emptyDutyComponent
  const DutyList = props.dutyListComponent
  const ref = React.useRef(null)
  const [sessionTypes] = useQuery(getSessionTypes, {})
  const lists = React.useMemo(
    () =>
      theatreLists
        .filter((l) => l.theatreId == location && l.day == dutyDay)
        .sort((a, b) =>
          a.sessionType.startTime == b.sessionType.startTime
            ? 0
            : a.sessionType.startTime < b.sessionType.startTime
            ? -1
            : 1
        ),
    [location, theatreLists, dutyDay]
  )
  const clash = React.useMemo(() => getClashes(lists, sessionTypes), [getClashes,lists, sessionTypes])
  return (
    <TableCell
      tabIndex={0}
      ref={ref}
      sx={{
        bgcolor: "background",
        cursor: "pointer",
        fontFamily: "Gill Sans, Gill Sans MT, Calibri, Trebuchet MS, sans-serif",

        fontSize: "small",
        "&:hover": { bgcolor: "#f9f9ff" },
      }}
    >
      {clash ? <Alert severity="warning">Sessions overlap</Alert> : ""}
      <Box sx={{ width: "100%", height: "100%", borderColor: "blue", borderWidth: 1 }}>
        {lists.map(
          (list) => list && <DutyList key={list.id} dutyList={list} allLists={theatreLists} />
        )}
        <EmptyDuty day={dutyDay} theatreId={location} />
      </Box>
    </TableCell>
  )
}
