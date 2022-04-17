import React, { SyntheticEvent, useContext } from "react"
import { SettingsContext } from "../context"
import { useDraggable, useDroppable } from "@dnd-kit/core"
import { useDispatchAction } from "../useDispatchAction"
import { useSession,useQuery } from "blitz"
import { Box, Dialog,DialogContent,DialogTitle,DialogContentText,DialogActions,Paper, Card, Divider, Button, IconButton,Grid, Table, TableCell, TableRow, TableBody, Tooltip } from "@material-ui/core"
import { styled } from "@material-ui/styles"
import { Prisma } from "db"
import { Delete, Edit, ContentCut,HorizontalSplit,Splitscreen,AddCircle } from "@material-ui/icons"
import { ActionTypes } from './ActionTypes'
import { ListChangeForm } from "./requestListSpecChangeForm"
import { useGetClashes } from "./useGetClashes"
import getSessionTypes from "./queries/getSessionTypes"
import { useState } from "react-transition-group/node_modules/@types/react"

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

export interface DutyListProps {
  dutyList: TheatreListExt
  allLists:TheatreListExt[]
}
interface DutyProps {
  duty: DutyExt
  listSession: string
  getClashes
}

const useHooks = ({ data, id }) => {
  const editMode = useSession().branch != "public"
  const dispatch = useDispatchAction()
  const draginfo = useDraggable({ id: "drag" + id, data, disabled: !editMode })
  const dropinfo = useDroppable({ id: "drop" + id, data, disabled: !editMode })
  const ref = React.useRef(null)
  return React.useMemo(
    () => ({
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
      register: (el) => {
        ref.current = el
        draginfo.setNodeRef(el)
        dropinfo.setNodeRef(el)
      },
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
      handleEditButton: (e: SyntheticEvent) => {

          e.preventDefault()
          e.stopPropagation()
          dispatch({
            ...data,
            type: ActionTypes.requestListChange,
            ref,
          })

      },
      handleDeleteList: (e: SyntheticEvent) => {
          e.preventDefault()
          e.stopPropagation()
          dispatch({
            ...data,
            type: ActionTypes.requestDeleteList,
            ref,
          })

      },
      handleSplitButton: (e: SyntheticEvent) => {


          e.preventDefault()
          e.stopPropagation()
          dispatch({
            ...data,
            type: ActionTypes.requestListSplit,
            ref,
          })

      },

    handleAddButton: (e: SyntheticEvent) => {


          e.preventDefault()
          e.stopPropagation()
          dispatch({
            ...data,
            type: ActionTypes.requestNewList,
            ref,
          })

      }
    }),
    [data, dispatch, draginfo, dropinfo, editMode]
  )
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
  const editMode = useSession().branch != "public"
  return editMode ? <EditableDutyList {...props} /> : <ReadOnlyDutyList {...props}/>
}

export function ReadOnlyDutyList(props: DutyListProps) {
  const { dutyList } = props
  const { id, theatreId, day } = dutyList

  const [sessionTypes] = useQuery(getSessionTypes, {})
  const getClashes = () => []
  const register=()=>{}
  return (
    <BaseDutyList
      canDrop={false}
      register={register}
      getClashes={getClashes}
      attributes={{}}
      dutyList={dutyList}
    ><div/></BaseDutyList>

  )
}

export function EditableDutyList(props: DutyListProps) {
  const { dutyList } = props
  const { id, theatreId, day } = dutyList

  const { dropinfo, attributes, listeners, register, style, handleDeleteList, handleSplitButton } =
    useHooks({
      data: { type: "list", list: dutyList },
      id: day + theatreId + id,
    })
  const canDrop = dropinfo?.isOver && dropinfo?.active!.id !== day + id
  const [sessionTypes] = useQuery(getSessionTypes, {})
  const getClashes = useGetClashes(theatreId, day, sessionTypes)
  return (
    <BaseDutyList
      canDrop={canDrop}
      register={register}
      getClashes={getClashes}
      attributes={{ style, ...attributes, ...listeners }}
      dutyList={dutyList}
    >
        <EditingButtons
          {...{
            handleDeleteList,
            dutyList,
            handleSplitButton,
          }}
        />
    </BaseDutyList>
  )
}

function BaseDutyList({ canDrop, register, getClashes,attributes, dutyList,children }) {
  const {
    id,
    sessionType: { name: sessionName },
    sessionTypeId,
    theatreId,
    specialty,
    surgeon,
    day,
    duties,
  } = dutyList
  return (
    <Paper
      sx={{
        borderWidth: 1,
        marginBottom: 1,
        borderColor: canDrop ? "theme.palette.primary.main" : "theme.palette.text.primary",
        borderStyle: "solid",
        backgroundColor: "theme.palette.background.paper",
        zIndex: canDrop ? -10 : undefined,
        width: "100%",
        minWidth: "6em",
      }}
      ref={register}
      {...attributes}

    >
      <Grid container>
        <Grid item xs={12}>
          <DutyTime>{sessionName}</DutyTime>
        </Grid>
        <Grid item xs={12}>
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
        </Grid>
        <Grid item xs={12}>
          <Divider />
          {duties.length == 0 ? (
            <span>-</span>
          ) : (
            duties.map((duty) => (
              <Duty key={duty.id} listSession={sessionTypeId} duty={duty} getClashes={getClashes} />
            ))
          )}

          <Divider />
        </Grid>
        {children}

      </Grid>
    </Paper>
  )
}

export interface EmptyDutyProps {
  day: string
  theatreId: string
}

export const EmptyDuty = React.memo(function EmptyDuty(props: EmptyDutyProps) {
  const { day, theatreId } = props
  const editMode = useSession().branch != "public"
  const [addDialog, setAddDialog] = React.useState(false)
  const handleAddButton=()=>setAddDialog(true)
  const { dropinfo, register} = useHooks({
    id: `${day}${location}`,
    data: { type: "vacant", list:{day, theatreId } },
  })

  if (!editMode) return null

  return (

    <Paper
      elevation={dropinfo.isOver ? 3 : 0}
      sx={{
        textAlign: "center",
        verticalAlign: "center",
        color: "theme.palette.text.disabled",
        borderWidth: 1,
        height: "100%",
        width: "100%",
        //margin: 2,
        borderColor: dropinfo.isOver ? "theme.palette.primary.main" : "theme.palette.text.disabled",
        borderStyle: "solid",
        bgcolor:'transparent'
      }}
      ref={register}

    >
<Tooltip title='add'>
      <IconButton
        onClick={handleAddButton}

      >
        <AddCircle fontSize='small' sx={{ color: (theme)=>theme.palette.text.disabled }}/>
      </IconButton>
      </Tooltip>
      <ListChangeForm listToChange={addDialog?{day,theatreId}:null} resetList={()=>setAddDialog(false)}/>
    </Paper>
  )
})



export const Duty = React.memo(function Duty(props: DutyProps) {
  const { duty,listSession,getClashes } = props
  const { draginfo, register, style } = useHooks({
    id: "" + duty.id,
    data: { type: "duty", duty },
  })
  function isPartialDuty(duty) {
    return duty.sessionTypeId != null && duty.sessionTypeId!=listSession
  }
  const clash = getClashes(duty.staffMemberId, duty.sessionTypeId).map(c => <div key={c}>{c}</div>)
  return (
    <Box
      sx={{
        position: "relative",
      }}
      ref={register}
      {...draginfo.attributes}
      {...draginfo.listeners}
      style={style}
    >
      {isPartialDuty(duty) && <Box sx={{ fontSize: "x-small" }}>{duty.sessionType.name}</Box>}
      <Tooltip title={<>
        <div>{duty.staffMember.firstName} {duty.staffMember.lastName}</div>
        <div>{clash ?? ""}</div>
        <div>Stage of training</div>
        <div>Owed time:</div>
      </>
      }>
        <Box sx={{ color: "red" }}>
          {duty.staffMember.firstName} {duty.staffMember.lastName} {clash[0] ? "⚠️" : ""}
        </Box>
      </Tooltip>
    </Box>
  )
})

function EditingButtons({
  handleDeleteList,
  dutyList,
  handleSplitButton }) {
  const {
    sessionType:{name:sessionName},
    theatreId,
    day,
  } = dutyList
  const [confirmDeleteDialogIsOpen, setConfirmDeleteDialogOpen] = React.useState(false)
  const [editDialogIsOpen, setEditDialogOpen] = React.useState(false)
  const handleEditButton = React.useCallback(() => setEditDialogOpen(true), [setEditDialogOpen])
  const handleDeleteButton=React.useCallback(()=>setConfirmDeleteDialogOpen(true),[setConfirmDeleteDialogOpen])
  return <>
    <Grid item xs={4} textAlign="center">
      <Tooltip title="Delete list">
        <IconButton onClick={handleDeleteButton} size="small">
          <Delete fontSize="small" />
        </IconButton>
      </Tooltip>
      <Dialog
        open={confirmDeleteDialogIsOpen}
        onClose={() => setConfirmDeleteDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm delete list"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Please confirm you want to delete this list: <br />
            {day}
            <br /> {theatreId}
            <br /> {sessionName}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            autoFocus
            onClick={() => setConfirmDeleteDialogOpen(false)}
            color="primary"
          >
            Cancel
          </Button>
          <Button onClick={handleDeleteList} color="primary">
            Confirm Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
    <Grid item xs={4} textAlign="center">
      <Tooltip title='Edit list'>
        <IconButton onClick={handleEditButton} size="small">
          <Edit fontSize="small" />
        </IconButton>
      </Tooltip>
      <ListChangeForm
        listToChange={editDialogIsOpen ? dutyList : null}
        resetList={() => setEditDialogOpen(false)} />
    </Grid>
    <Grid item xs={4} textAlign="center">
      <Tooltip title='Split/Clone list'>
        <IconButton size="small">
          <Splitscreen onClick={handleSplitButton} fontSize="small" />
        </IconButton>
      </Tooltip>
    </Grid>
  </>
}

