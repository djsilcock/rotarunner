import { makeStyles } from "@material-ui/core";


export const useStyles = makeStyles((theme) => ({
  weekView: {
    backgroundColor: theme.palette.divider,
    width: '100%'
  },
  timeIndicator: {
    height: 2,
    borderSpacing: 0,
    paddingTop: 0,
    display: "flex",
  },
  onShift: {
    backgroundColor:theme.palette.text.primary,
  },
  offShift: {
    backgroundColor:theme.palette.text.hint,
  },
  duty: {
    position: 'relative'
  },
  dutyCell: {
    backgroundColor: theme.palette.background.default,
    //padding:'2px',
    cursor: 'pointer',
    fontFamily: "Gill Sans, Gill Sans MT, Calibri, Trebuchet MS, sans-serif",
    width: "12.5%",
    fontSize:'small',
  
},

  core: {
    color: "green",
  },
  intermediate: {
    color: "orange",
  },
  higher: {
    color: "red",
  },

  dutyTime: {
    fontSize: "x-small",
    color: theme.palette.primary.dark,
  },
  staffLevel: {
    fontSize: "x-small",
    color: theme.palette.secondary.dark,
  },
  theatreDescription: {
    fontSize: "x-small",
    color: "red",
  },

  weekday: {
    fontFamily: "Gill Sans, Gill Sans MT, Calibri, Trebuchet MS, sans-serif",
    "&.today": {
      fontWeight: "bold",
    },
  },
}));
