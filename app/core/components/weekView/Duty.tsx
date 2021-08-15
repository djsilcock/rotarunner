import React, { SyntheticEvent, useContext } from "react"
import { SettingsContext } from "../context"
import { useDraggable, useDroppable } from "@dnd-kit/core"
import { useDispatchAction } from "../useDispatchAction"
import { useSession } from "blitz"
import { styles } from "./useStyles"
import { Box, Paper, Card, Divider } from "@material-ui/core"
import { SessionType, Specialty, StaffDuty, Surgeon, TheatreList } from "db"

export interface TheatreListProp extends TheatreList {
  specialty?: Specialty | null
  sessionType: SessionType
  surgeon?: Surgeon | null
  duties: StaffDuty[]
}
interface DutyListProps {
  dutyList: TheatreListProp
}

const useHooks = ({ data, id }) => {
  const editMode = useSession().branch != "public"
  const dispatch = useDispatchAction()
  const draginfo = useDraggable({ id: "drag" + id, data, disabled: !editMode })
  const dropinfo = useDroppable({ id: "drop" + id, data, disabled: !editMode })
  const ref = React.useRef(null)
  return {
    draginfo,
    dropinfo,
    attributes: draginfo.attributes,
    listeners: draginfo.listeners,
    style: {
      transform:
        draginfo.transform == null
          ? undefined
          : `translate3d(${draginfo.transform.x}px, ${draginfo.transform.y}px, 0)`,
      opacity: draginfo.isDragging ? 0.6 : 1,
    },
    register: React.useCallback(
      (el) => {
        console.log(`registering ${id}`, el)
        ref.current = el
        draginfo.setNodeRef(el)
        dropinfo.setNodeRef(el)
      },
      [draginfo, ref, dropinfo, id]
    ),
    handleContextMenu: (e: SyntheticEvent) => {
      console.log("context menu clicked")
      if (editMode) {
        e.preventDefault()
        e.stopPropagation()
        dispatch({
          type: "contextmenu",
          celldata: data,
          ref,
        })
      }
    },
  }
}

export function DutyList(props: DutyListProps) {
  const { dutyList } = props
  const {
    id,
    sessionType: { startTime, finishTime, name: sessionName },
    specialtyId,
    surgeonId,
    theatreId,
    specialty,
    surgeon,
    day,
    duties,
  } = dutyList

  const { dropinfo, attributes, listeners, register, style, handleContextMenu } = useHooks({
    data: { type: "list", list: dutyList },
    id: day + theatreId + id,
  })

  return (
    <Paper
      sx={styles.theatreList({ canDrop: dropinfo.isOver && dropinfo.active!.id !== day + id })}
      ref={register}
      onContextMenu={handleContextMenu}
      {...attributes}
      {...listeners}
      style={style}
    >
      <Box sx={styles.theatreListHeader}>
        <Box sx={styles.dutyTime}>{sessionName}</Box>
        <Box sx={styles.theatreDescription}>
          {specialty?.name ?? ""}
          {specialty?.name && surgeon?.firstName ? " - " : ""}

          {surgeon && (
            <span>
              {surgeon?.firstName /*.split(' ').map(s=>s.slice(0,1)).join('')*/ ?? ""}{" "}
              {surgeon?.lastName ?? ""}
            </span>
          )}
        </Box>
      </Box>
      <Divider />
      {duties.length == 0 ? (
        <span>-</span>
      ) : (
        duties.map((duty) => <Duty key={duty.id} duty={duty} />)
      )}
    </Paper>
  )
}

interface EmptyDutyProps {
  dutyDay: string
  location: string
}

export const EmptyDuty = React.memo(function EmptyDuty(props: EmptyDutyProps) {
  const { dutyDay, location } = props
  const editMode = useSession().branch != "public"

  const { dropinfo, register, handleContextMenu } = useHooks({
    id: `${dutyDay}${location}`,
    data: { type: "vacant", dutyDay, location },
  })

  if (!editMode) return null

  return (
    <Card
      elevation={dropinfo.isOver ? 3 : 0}
      sx={styles.emptyTheatre({ canDrop: dropinfo.isOver })}
      ref={register}
      onContextMenu={handleContextMenu}
    >
      +
    </Card>
  )
})
interface DutyProps {
  duty
}

export const Duty = React.memo(function Duty(props: DutyProps) {
  const { duty } = props
  const { draginfo, register, handleContextMenu, style } = useHooks({
    id: "" + duty.id,
    data: { type: "duty", duty },
  })
  function isPartialDuty(duty) {
    return typeof duty.startTime != "undefined"
  }
  return (
    <Box
      sx={styles.duty}
      ref={register}
      title={`${duty.staffmember.firstName} ${duty.staffmember.lastName} - ${duty.staffmember.staffLevel}`}
      onContextMenu={handleContextMenu}
      {...draginfo.attributes}
      {...draginfo.listeners}
      style={style}
    >
      {isPartialDuty(duty) && (
        <Box sx={styles.dutyTime}>
          {duty.sessionType.startTime}-{duty.sessionType.finishTime % 24}
        </Box>
      )}
      <Box sx={styles[duty.staffmember.staffGroup]}>
        {duty.staffmember.firstName} {duty.staffmember.lastName}
      </Box>
      {duty.staffmember.staffLevel && (
        <Box component="span" sx={styles.staffLevel}>
          {"(" + duty.staffmember.staffLevel + ")"}
        </Box>
      )}
    </Box>
  )
})
