import { IStaffCompleteDuty, IStaffPartialDuty } from "../../old_app/lib/datalayer"

export type OpenContextMenuFn = (el: HTMLElement | null, data) => void
export type ModifyDutyFn = (data: {
  type: string
  from: Partial<DutyProps>
  to: Partial<DutyProps>
}) => void

interface DutyPropsMixin {
  openContextMenu?: OpenContextMenuFn
  modifyDuty: ModifyDutyFn
}
type DutyPropsPartial = IStaffPartialDuty & DutyPropsMixin
type DutyPropsComplete = IStaffCompleteDuty & DutyPropsMixin
type DutyProps = DutyPropsPartial | DutyPropsComplete
