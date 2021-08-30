import React, { SyntheticEvent, useContext } from "react"
import { SettingsContext } from "../context"
import { useDraggable, useDroppable } from "@dnd-kit/core"
import { useDispatchAction } from "../useDispatchAction"
import { useSession } from "blitz"
import { styles } from "./useStyles"
import { Box, Paper, Card, Divider } from "@material-ui/core"
import { SessionType, Specialty, StaffDuty, StaffMember, Surgeon, TheatreList } from "db"
import { styled } from "@material-ui/styles"
import { Prisma } from "db"

const theatreListWithRelations = Prisma.validator<Prisma.TheatreListArgs>()({
  include: {
    specialty: true,
    sessionType: true,
    surgeon: true,
    duties: {
      include: {
        staffMember: true,
        sessionType: true,
      },
    },
  },
})

const staffDutyWithRelations = Prisma.validator<Prisma.StaffDutyArgs>()({
  include: {
    staffMember: true,
    sessionType: true,
  },
})

export type TheatreListExt = Prisma.TheatreListGetPayload<typeof theatreListWithRelations>
type DutyExt = Prisma.StaffDutyGetPayload<typeof staffDutyWithRelations>

interface DutyListProps {
  dutyList: TheatreListExt
}
interface DutyProps {
  duty: DutyExt
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

const DutyTime = styled("div")({
  fontSize: "x-small",
  fontWeight: "bold",
  color: "theme.palette.primary.dark",
})

const TheatreDescription = styled("div")({
  fontSize: "x-small",
})

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

  const canDrop = dropinfo.isOver && dropinfo.active!.id !== day + id

  return (
    <Paper
      sx={{
        borderWidth: 1,
        marginBottom: 1,
        borderColor: canDrop ? "theme.palette.primary.main" : "theme.palette.text.primary",
        borderStyle: "solid",
        backgroundColor: "theme.palette.background.paper",
        zIndex: canDrop ? -10 : undefined,
      }}
      ref={register}
      onContextMenu={handleContextMenu}
      {...attributes}
      {...listeners}
      style={style}
    >
      <DutyTime>{sessionName}</DutyTime>
      <TheatreDescription>
        {specialty?.name ?? ""}
        {specialty?.name && surgeon?.firstName ? " - " : ""}

        {surgeon && (
          <span>
            {surgeon?.firstName /*.split(' ').map(s=>s.slice(0,1)).join('')*/ ?? ""}{" "}
            {surgeon?.lastName ?? ""}
          </span>
        )}
      </TheatreDescription>

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
      sx={{
        textAlign: "center",
        verticalAlign: "center",
        color: "theme.palette.text.disabled",
        borderWidth: 1,
        height: "100%",
        margin: 2,
        borderColor: dropinfo.isOver ? "theme.palette.primary.main" : "theme.palette.text.disabled",
        borderStyle: "solid",
      }}
      ref={register}
      onContextMenu={handleContextMenu}
    >
      +
    </Card>
  )
})

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
      sx={{
        position: "relative",
      }}
      ref={register}
      title={`${duty.staffMember.firstName} ${duty.staffMember.lastName}`}
      onContextMenu={handleContextMenu}
      {...draginfo.attributes}
      {...draginfo.listeners}
      style={style}
    >
      {isPartialDuty(duty) && (
        <Box sx={{ fontSize: "x-small" }}>
          {duty.sessionType.startTime}-{duty.sessionType.finishTime % 24}
        </Box>
      )}
      <Box sx={{ color: "red" }}>
        {duty.staffMember.firstName} {duty.staffMember.lastName}
      </Box>
      {/*duty.staffMember.staffLevel && (
        <Box
          component="span"
          sx={{
            fontSize: "x-small",
            color: "theme.palette.secondary.dark",
          }}
        >
          {"(" + duty.staffMember.staffLevel + ")"}
        </Box>
      )*/}
    </Box>
  )
})
