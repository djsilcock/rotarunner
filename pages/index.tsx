import {flow} from "mobx";
import React, { ReactNode, useContext, useState } from "react";
import { KeyboardDatePicker as DatePicker } from "@material-ui/pickers";
import WeekView from "../components/weekView";
import {
  Container,
  makeStyles,
  useMediaQuery,
} from "@material-ui/core";
import { getTagFromDuty} from "../components/weekView/getTagFromDuty";
import { SettingsContext } from "../components/context";
import { PopupDialog, requestDialog } from "../components/popupdialog";




const useStyles = makeStyles({
  drawer: {
    width: "20em",
  },
  container: {
    padding: "1em",
  },
});

//move options

const modifyDuty = flow(function* (allDuties, requestDialog,{ type, from, to: { dutyDay, location} }) {  
  switch (type) {
    case 'move':
      {
        if (getTagFromDuty(from) == getTagFromDuty({ dutyDay, location })) return
        const target = allDuties.findIndex(d => (d.id == from.id))
  
        try {
          
            yield requestDialog(new Map([['onlyJohn','Move only John'],['harry','Move all']]),'move duty')
          
          allDuties[target].dutyDay = dutyDay
          allDuties[target].location = location
        } catch (e) {
          return
        }
        return
      }
    default:
      console.error('unknown type:'+type)
  }
})

export default function App(): ReactNode {
  const allDuties = useContext(SettingsContext).data
  const theatreNames=useContext(SettingsContext).theatreNames
  const [date, setDate] = useState(new Date());
  const isMobile = useMediaQuery("(max-width: 400px)");
  const [popupState,setPopupState]=useState(null)
  const classes = useStyles();
  return (    
    <Container fixed className={classes.container}>
      <PopupDialog {...{ popupState, setPopupState }}/>
        <DatePicker
          value={date}
          autoOk={true}
          format="dd/MM/yyyy"
          variant={isMobile ? "dialog" : "inline"}
          onChange={setDate}
        />
        <div style={{ height: "10px" }}></div>
        <WeekView
          viewDate={date}
          modifyDuty={(data)=>modifyDuty(allDuties,requestDialog.bind(this,setPopupState),data)}
          allDuties={allDuties}
          theatreNames={theatreNames}
        />
      </Container>
  );
}
App.pageTitle="This week"