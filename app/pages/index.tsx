import React, { ReactNode, useContext, useState } from "react"
import DatePicker from "@material-ui/lab/DatePicker"
import WeekView from "../core/components/weekView"
import { Container, useMediaQuery } from "@material-ui/core"
import makeStyles from "@material-ui/styles/makeStyles"
import { getTagFromDuty } from "../core/components/weekView/getTagFromDuty"
import { SettingsContext } from "../core/components/context"
import { PopupDialog } from "../core/components/PopupDialog"
import { MaterialUiPickersDate } from "@material-ui/pickers/typings/date"
import { TextField } from "@material-ui/core"

//move options

export default function App(): ReactNode {
  const [date, setDate] = useState<MaterialUiPickersDate>(new Date())
  const isMobile = useMediaQuery("(max-width: 400px)")
  const [popupState, setPopupState] = useState(null)
  return (
    <Container fixed sx={{ padding: "1em" }}>
      <DatePicker
        renderInput={(props) => <TextField {...props} />}
        value={date}
        inputFormat="dd/MM/yyyy"
        onChange={setDate}
      />
      <div style={{ height: "10px" }}></div>
      <WeekView viewDate={date} />
    </Container>
  )
}
App.pageTitle = "This week"
