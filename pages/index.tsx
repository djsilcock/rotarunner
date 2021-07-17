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
import { PopupDialog} from "../components/PopupDialog";




const useStyles = makeStyles({
  drawer: {
    width: "20em",
  },
  container: {
    padding: "1em",
  },
});

//move options



export default function App(): ReactNode {
  const {getListsForTheatreDay,getTheatreNames,dispatchAction} = useContext(SettingsContext)
  const [date, setDate] = useState(new Date());
  const isMobile = useMediaQuery("(max-width: 400px)");
  const [popupState,setPopupState]=useState(null)
  const classes = useStyles();
  return (    
    <Container fixed className={classes.container}>
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
        />
      </Container>
  );
}
App.pageTitle="This week"