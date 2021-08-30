import React from "react"
import { DutyList, EmptyDuty, TheatreListExt } from "./Duty"
import { SettingsContext } from "../context"
import { useQuery, useSession } from "blitz"
import getListsForTheatreDay from "./queries/getListsForTheatreDay"
import { styles } from "./useStyles"
import { TableCell } from "@material-ui/core"
import { TheatreList } from "db"

interface DutyCellProps {
  dutyDay: string
  location: string
  theatreLists: TheatreListExt[]
}

export function DutyCell(props: DutyCellProps) {
  const { dutyDay, location, theatreLists } = props
  const lists = React.useMemo(
    () => theatreLists.filter((l) => l.theatreId == location && l.day == dutyDay),
    [location, theatreLists, dutyDay]
  )
  const ref = React.useRef(null)
  return (
    <TableCell
      tabIndex={0}
      ref={ref}
      sx={{
        bgcolor: "background",
        cursor: "pointer",
        fontFamily: "Gill Sans, Gill Sans MT, Calibri, Trebuchet MS, sans-serif",
        width: "12.5%",
        fontSize: "small",
      }}
    >
      {lists.length == 0 ? (
        <EmptyDuty dutyDay={dutyDay} location={location} />
      ) : (
        lists.map((list) => list && <DutyList key={list.id} dutyList={list} />)
      )}
    </TableCell>
  )
}
