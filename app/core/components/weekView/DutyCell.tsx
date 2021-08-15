import React from "react"
import { DutyList, EmptyDuty, TheatreListProp } from "./Duty"
import { SettingsContext } from "../context"
import { useQuery, useSession } from "blitz"
import getListsForTheatreDay from "./queries/getListsForTheatreDay"
import { styles } from "./useStyles"
import { TableCell } from "@material-ui/core"
import { TheatreList } from "db"

interface DutyCellProps {
  dutyDay: string
  location: string
  theatreLists: TheatreListProp[]
}

export function DutyCell(props: DutyCellProps) {
  const { dutyDay, location, theatreLists } = props
  const lists = React.useMemo(
    () => theatreLists.filter((l) => l.theatreId == location && l.day == dutyDay),
    [location, theatreLists, dutyDay]
  )
  const ref = React.useRef(null)
  return (
    <TableCell tabIndex={0} ref={ref} sx={styles.dutyCell} data-target="hello">
      {lists.length == 0 ? (
        <EmptyDuty dutyDay={dutyDay} location={location} />
      ) : (
        lists.map((list) => list && <DutyList key={list.id} dutyList={list} />)
      )}
    </TableCell>
  )
}
