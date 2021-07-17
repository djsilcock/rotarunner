import React, { SyntheticEvent, useContext } from "react";
import { observer } from "mobx-react-lite";
import { useStyles } from "./useStyles";
import { SettingsContext } from "../context";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { IStaffDuty, IStaffPartialDuty } from "../../lib/datalayer";
import { useDispatchAction } from "../useDispatchAction";

interface DutyListProps {
  dutyList;
}

const useHooks = ({ data, id }) => {
  const settings = useContext(SettingsContext)
  const dispatch=useDispatchAction()
  const draginfo = useDraggable({ id, data, disabled: !settings.editMode })
  const dropinfo = useDroppable({ id, data, disabled: !settings.editMode })
  const ref = React.useRef(null);
  return {
    draginfo,
    dropinfo,
    attributes: draginfo.attributes,
    listeners: draginfo.listeners,
    style: {
      transform: draginfo.transform == null ? undefined : `translate3d(${draginfo.transform.x}px, ${draginfo.transform.y}px, 0)`,
      opacity: draginfo.isDragging ? 0.6 : 1,
      },
    register: React.useCallback((el) => {
      ref.current = el;
      draginfo.setNodeRef(el);
      dropinfo.setNodeRef(el);
    }, [draginfo, ref]),
    handleContextMenu(e:SyntheticEvent) {
      if (settings.editMode) {
        e.preventDefault()
        e.stopPropagation()
        dispatch({
          type: 'contextmenu',
          celldata: data,
          ref,
          
        })
      }
      },
  }
}
/*
const handleClose = React.useMemo(() => ({
  spec() {
    setAnchorEl(null)
    settings.dispatchAction({ type: 'changeSpecialty', list: dutyList })
  },
  move() {
    setAnchorEl(null)
    settings.dispatchAction({ type: 'moveList', list: dutyList })
  },
  split() {
    setAnchorEl(null)
    settings.dispatchAction({ type: 'splitList', list: dutyList })
  },
  add() {
    setAnchorEl(null)
    settings.dispatchAction({ type: 'addPeople', list: dutyList })
  },
  timing() {
    setAnchorEl(null)
    settings.dispatchAction({ type: 'timing', list: dutyList })
  },
  delete() {
    console.log('delete pressed')
    setAnchorEl(null)
    settings.dispatchAction({ type: 'deleteList', list: dutyList })
  },
  cancel() { setAnchorEl(null) }
}), [])
  
<Menu
  id="simple-menu"
  anchorEl={anchorEl}
  keepMounted
  open={Boolean(anchorEl)}
  onClose={handleClose.cancel}
>
  <MenuItem onClick={handleClose.spec}> Change surgeon/specialty</MenuItem>
  <MenuItem onClick={handleClose.move}> Move...</MenuItem>
  <MenuItem onClick={handleClose.timing}> Change times... </MenuItem>
  <MenuItem onClick={handleClose.split}> Split</MenuItem>
  <MenuItem onClick={handleClose.add}> Add people...</MenuItem>
  <MenuItem onClick={handleClose.delete}> Delete list</MenuItem>

</Menu>
*/

export const DutyList = observer(function DutyList(props: DutyListProps) {
  const { dutyList }=props
  const {
      id,
      startTime,
      duration,
      specialty,
      surgeon,
      duties 
  } = dutyList;
  const classNames = useStyles();
  const {dropinfo, attributes, listeners, register, style,handleContextMenu } = useHooks({ data: { type: 'list', list: dutyList },id})
  
  return (
    <div className={`${classNames.theatreList}${(dropinfo.isOver && dropinfo.active.id !== id) ? ' canDrop' : ''}`}
      ref={register}
      onContextMenu={handleContextMenu}
      {...attributes}
      {...listeners}
      style={style}>
      
      <div className={classNames.theatreListHeader}>      
        <div className={classNames.theatreDescription}>{specialty} {surgeon && <div>{surgeon}</div>}</div>
        <div className={classNames.dutyTime}>
          {startTime}-{(startTime + duration) % 24}
        </div>
      </div>
      {duties.length == 0 ? <span>-</span> : duties.map((duty) => <Duty key={duty.id} duty={duty} />)}
    </div>
  );
});

interface EmptyDutyProps {
  dutyDay: Date;
  location: string,
}

export const EmptyDuty = observer(function DutyList(props: EmptyDutyProps) {
  const { dutyDay, location} = props
  const classNames = useStyles();
  const { editMode } = useContext(SettingsContext)
  
  const { dropinfo, register,handleContextMenu } = useHooks({
    id: `${dutyDay.toDateString()}${location}`,
    data: { type: 'vacant', dutyDay, location }
  })

  if (!editMode) return null

  return (
    <div className={`${classNames.emptyTheatre}${dropinfo.isOver ? ' canDrop' : ''}`}
      ref={register}
      onContextMenu={handleContextMenu}>

      <div className={classNames.emptyTheatre}>
        +
      </div>
    </div>
  );
});
interface DutyProps{
  duty: IStaffDuty;
}


export const Duty = observer(function Duty(props: DutyProps) {
  const { duty}=props
  const classNames = useStyles();
  const { draginfo,register,handleContextMenu,style } = useHooks(
    {
      id: '' + duty.id,
      data: { type: 'duty', duty }
    })
  function isPartialDuty(duty): duty is IStaffPartialDuty{
    return typeof duty.startTime != 'undefined'
  }
  return (
    <div className={classNames.duty}
      ref={register}
      title={`${duty.staffmember.firstName} ${duty.staffmember.lastName} - ${duty.staffmember.staffLevel}`}
      onContextMenu={handleContextMenu}
      {...draginfo.attributes}
      {...draginfo.listeners}
      style={style}>
      {isPartialDuty(duty) && <div className={classNames.dutyTime}>
        {duty.startTime}-{(duty.startTime + duty.duration) % 24}
      </div>}
      <div className={classNames[duty.staffmember.staffGroup]}>{duty.staffmember.firstName} {duty.staffmember.lastName}</div>
      {duty.staffmember.staffLevel && (
        <span className={classNames.staffLevel}>{"(" + duty.staffmember.staffLevel + ")"}</span>
      )}
    </div>

  );
});
