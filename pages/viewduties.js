import { action, computed, observable } from "mobx";
import React from "react";
import { KeyboardDatePicker as DatePicker } from "@material-ui/pickers";
import MonthView from "../components/monthView";
import setTimeValues from "../utils/setTimeValues";
import {
  Container,
  makeStyles,
  useMediaQuery,
} from "@material-ui/core";
import { computedFn } from "mobx-utils";

const allDuties = observable([
  {
    id: 0,
    location: "EmgTh",
    startTime: setTimeValues(Date.now(), {
      hour: 8,
      minute: 0,
      second: 0,
      ms: 0,
    }),
    finishTime: setTimeValues(Date.now(), {
      hour: 18,
      minute: 0,
      second: 0,
      ms: 0,
    }),
    staffName: "Joe Bloggs",
    staffLevel: "ST5",
    staffGroup: "higher",
  },
  {
    id: 1,
    location: "EmgTh",
    startTime: setTimeValues(Date.now() + 3600 * 1000 * 24, {
      hour: 13,
      minute: 0,
      second: 0,
      ms: 0,
    }),
    finishTime: setTimeValues(Date.now() + 3600 * 1000 * 24, {
      hour: 18,
      minute: 0,
      second: 0,
      ms: 0,
    }),
    staffName: "Fred Bloggs",
    staffLevel: "CT1",
    staffGroup: "core",
  },
]);
const theatreNames = [
  { shortName: "EmgTh", theatreName: "Emergency Theatre" },
  { shortName: "ICU", theatreName: "ICU" },
  { shortName: "Th1", theatreName: "Theatre 1" },
];


const getDuties=computedFn(function (staffName, startTime) {
    return allDuties.filter((thisDuty) =>
        thisDuty.startTime.toDateString() == startTime.toDateString() &&
        thisDuty.staffName == staffName
      )}
    );

const useStyles = makeStyles({
  drawer: {
    width: "20em",
  },
  container: {
    padding: "1em",
  },
});

export default function App() {
  const [date, setDate] = React.useState(new Date());
  const isMobile = useMediaQuery("(max-width: 400px)");
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
        <button
          type="button"
          onClick={action(() => {
            const tomorrow = Date.now() + 3600 * 24 * 1000;
            allDuties[0].startTime = setTimeValues(tomorrow, {
              hour: 8,
              minute: 0,
              second: 0,
            });
            allDuties[0].finishTime = setTimeValues(tomorrow, {
              hour: 20,
              minute: 0,
              second: 0,
            });
          })}
        >
          Click to change
        </button>
        <div style={{ height: "10px" }}></div>
        <MonthView
          viewDate={date}
          getDuties={day=>getDuties('Joe Bloggs',day)}       
        />
      </Container>
  );
}
App.pageTitle="All Duties"