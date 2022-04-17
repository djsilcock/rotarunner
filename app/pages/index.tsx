import React, { ReactNode, useContext, useState } from "react"
import DatePicker from "@material-ui/lab/DatePicker"
import WeekView from "../core/components/weekView"
import { Container, Divider, ToggleButton, ToggleButtonGroup, useMediaQuery } from "@material-ui/core"
import { MaterialUiPickersDate } from "@material-ui/pickers/typings/date"
import { TextField } from "@material-ui/core"
import { GridView, ViewList } from "@material-ui/icons"
import logout from 'app/auth/mutations/logout'
import { invoke,BlitzPage } from "blitz"

//move options

const App:BlitzPage=function App() {
  const [date, setDate] = useState<MaterialUiPickersDate>(new Date())
  const isMobile = useMediaQuery("(max-width: 400px)")
  const [popupState, setPopupState] = useState(null)
  const [orientation,setOrientation]=useState(isMobile?'list':'grid')
  return (
    <Container fixed sx={{ padding: "1em" }}>
      <DatePicker
        renderInput={(props) => <TextField {...props} />}
        value={date}
        inputFormat="dd/MM/yyyy"
        onChange={setDate}
      />
&nbsp;
      <ToggleButtonGroup exclusive value={orientation} onChange={(e,v)=>setOrientation(v)}>
        <ToggleButton value='grid'><GridView/></ToggleButton>
        <ToggleButton value='list'><ViewList/></ToggleButton>
      </ToggleButtonGroup>
      <button onClick={()=>invoke(logout,{})}>Logout</button>
      <div style={{ height: "10px" }}></div>
      <WeekView viewDate={date} orientation={orientation}/>
    </Container>
  )
}
App.pageTitle = "This week"
App.authenticate=true
export default App
