import { makeStyles } from "@material-ui/core";
import zIndex from "@material-ui/core/styles/zIndex";


export const useStyles = makeStyles((theme) => ({
  weekView: {
    backgroundColor: theme.palette.divider,
    width: '100%'
  },
  emptyTheatre: {
    textAlign: 'center',
    verticalAlign: 'center',
    color: theme.palette.text.disabled,
    borderWidth: 1,
    margin: 2,
    borderColor: theme.palette.text.disabled,
    borderStyle: 'solid',
    '&.canDrop': {
      borderColor: theme.palette.primary.main,
      borderWidth:4
    }
  },
  theatreList: {
    borderWidth: 1,
    margin:2,
    borderColor: theme.palette.text.primary,
    borderStyle: 'solid',
    backgroundColor:theme.palette.background.paper,
    '&.canDrop': {
      borderColor: theme.palette.primary.main,
      borderWidth: 2,
      margin:1,
      zIndex:-10
    }
  },
  theatreListHeader: {   
    backgroundColor:theme.palette.divider,
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
    
  },

  weekday: {
    fontFamily: "Gill Sans, Gill Sans MT, Calibri, Trebuchet MS, sans-serif",
    "&.today": {
      fontWeight: "bold",
    },
  },
}));
