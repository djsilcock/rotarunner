import { isSameDay } from "date-fns"

export const styles = {
  weekView: {
    backgroundColor: "theme.palette.divider",
    width: "100%",
  },
  emptyTheatre: ({ canDrop }) => ({
    textAlign: "center",
    verticalAlign: "center",
    color: "theme.palette.text.disabled",
    borderWidth: 1,
    height: "100%",
    margin: 2,
    borderColor: canDrop ? "theme.palette.primary.main" : "theme.palette.text.disabled",
    borderStyle: "solid",
  }),
  theatreList: ({ canDrop }) => ({
    borderWidth: 1,
    marginBottom: 1,
    borderColor: canDrop ? "theme.palette.primary.main" : "theme.palette.text.primary",
    borderStyle: "solid",
    backgroundColor: "theme.palette.background.paper",
    zIndex: canDrop ? -10 : undefined,
  }),
  theatreListHeader: {
    backgroundColor: "theme.palette.divider",
  },
  timeIndicator: {
    height: 2,
    borderSpacing: 0,
    paddingTop: 0,
    display: "flex",
  },
  onShift: {
    backgroundColor: "theme.palette.text.primary",
  },
  offShift: {
    backgroundColor: "theme.palette.text.hint",
  },
  duty: {
    position: "relative",
  },
  dutyCell: {
    bgcolor: "background",
    //padding:'2px',
    cursor: "pointer",
    fontFamily: "Gill Sans, Gill Sans MT, Calibri, Trebuchet MS, sans-serif",
    width: "12.5%",
    fontSize: "small",
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
    fontWeight: "bold",
    color: "theme.palette.primary.dark",
  },
  staffLevel: {
    fontSize: "x-small",
    color: "theme.palette.secondary.dark",
  },
  theatreDescription: {
    fontSize: "x-small",
  },

  weekday: ({ day }) => ({
    fontFamily: "Gill Sans, Gill Sans MT, Calibri, Trebuchet MS, sans-serif",
    fontWeight: isSameDay(day, Date.now()) ? "bold" : undefined,
    textAlign: "center",
  }),
}
