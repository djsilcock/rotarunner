type OpenContextMenuFn = (el: HTMLElement | null, data: DutyProps | DutyCellProps) => void;
type ModifyDutyFn = (data: { type: string, from: Partial<DutyProps>, to: Partial<DutyProps> }) => void;
export interface DutyProps {
  id: string | number;
  startTime: number;
  duration: number;
  staffName: string;
  dutyDay: Date;
  location: string;
  staffLevel: string;
  staffGroup: string;
  openContextMenu?: OpenContextMenuFn;
  modifyDuty: ModifyDutyFn;
}
export interface DutyCellProps {
  dutyDay: Date;
  location: string;
  dutyMap: Map<string,Partial<DutyProps>[]>;
  openContextMenu: OpenContextMenuFn;
  modifyDuty: ModifyDutyFn;
}
