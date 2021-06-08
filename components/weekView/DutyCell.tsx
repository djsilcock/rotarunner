import React from "react";
import { observer } from "mobx-react-lite";
import { DutyCellProps, DutyProps } from "./types";
import { Duty } from "./Duty";
import { useStyles } from "./useStyles";
import { getTagFromDuty } from "./getTagFromDuty";
import { expr } from "mobx-utils";
import { slice } from "cypress/types/lodash";


export const DutyCell = observer(function DutyCell(props: DutyCellProps) {
  const classNames = useStyles();
  const {
    dutyDay,
    location,
    dutyMap,
    openContextMenu,
    modifyDuty
  } = props;
  const duties = (dutyMap.get(getTagFromDuty({ location, dutyDay })) ?? [])
    .slice()
    .sort((duty1, duty2) => { console.log(duty1, duty2); return ((duty1.staffGroup <= duty2.staffGroup)&&(duty1.startTime<=duty2.startTime)) ? 0 : 1 })
  const ref = React.useRef(null);

  return (
    <td
      tabIndex={0}
      onDragOver={e => {
        e.preventDefault();
      }}
      onDrop={e => { modifyDuty({ type: 'move', from: JSON.parse(e.dataTransfer.getData('application/myobj')), to: { dutyDay, location } }); }}
      ref={ref}
      className={classNames.dutyCell}
      onContextMenu={(e) => { e.preventDefault(); openContextMenu(ref.current, props); }}
    >
      {duties.map((duty:DutyProps) => <Duty key={duty.id} openContextMenu={openContextMenu} {...duty} />)}
    </td>
  );
});
