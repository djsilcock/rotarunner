import React from "react"
import InputLabel from "@material-ui/core/InputLabel"
import Input from "@material-ui/core/Input"
import MenuItem from "@material-ui/core/MenuItem"
import { FormControl, Box, Divider } from "@material-ui/core"
import Select, { SelectChangeEvent } from "@material-ui/core/Select"
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Grid,
} from "@material-ui/core"
import { useQuery, useMutation, invalidateQuery, setQueryData } from "blitz"
import getSurgeonsAndSpecialties from "./queries/getSurgeonsAndSpecialties"
import getSessionTypes from "./queries/getSessionTypes"
import getListInfo from "./queries/getListInfo"
import modifyList from "./mutations/modifyList"
import getListsForWeek from "./queries/getListsForWeek"
import startOfDay from "date-fns/startOfDay"
import getTheatres from "./queries/getTheatres"
import { DatePicker } from "@material-ui/lab"
import { Field, Form, useFormState } from "react-final-form"
import { TheatreList } from "db"
import { parseISO, formatISO } from "date-fns"

const styles = {
  container: {
    display: "flex",
    flexWrap: "wrap",
  },
  formControl: {
    margin: (theme) => theme.spacing(1),
    minWidth: 120,
  },
}

export function ListChangeForm({
  listToChange: id,
  resetList,
}: {
  listToChange: number | null
  resetList: (newvalue) => void
}) {
  const [specialtyOptions] = useQuery(getSurgeonsAndSpecialties, {})
  const [theatres] = useQuery(getTheatres, {})
  const [sessionTypes] = useQuery(getSessionTypes, {})
  const [initialValues] = useQuery(getListInfo, { id: id! }, { enabled: id != null })
  const [changeList] = useMutation(modifyList)
  React.useEffect(() => {
    console.log({ initialValues, sessionTypes })
  }, [initialValues, sessionTypes])
  const executeChange = (changes) =>
    changeList({
      list: initialValues as TheatreList,
      changes,
    })
      .then((results) => {
        invalidateQuery(getListsForWeek)
      })
      .then(() => resetList(null))

  const handleClose = (evt, reason) => {
    if (reason != "backdropClick") resetList(null)
  }

  return (
    <Dialog open={id != null} onClose={handleClose}>
      <DialogTitle>Modify list</DialogTitle>
      <Form onSubmit={executeChange} initialValues={initialValues}>
        {(formState) => (
          <>
            <DialogContent>
              <form>
                <Grid container rowSpacing={2}>
                  <Field name="specialtyId">
                    {(specialtyState) => {
                      console.log({ specialtyState })
                      return (
                        <>
                          <Grid item xs={6}>
                            <FormControl sx={styles.formControl}>
                              <InputLabel htmlFor="specialty">Specialty</InputLabel>
                              <Select
                                native
                                {...specialtyState.input}
                                input={<Input id="specialty" />}
                              >
                                <option aria-label="None" value="" />
                                {specialtyOptions.map(({ id, name }) => (
                                  <option key={id} value={id}>
                                    {name} ({id})
                                  </option>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                          <Field name="surgeonId" parse={(v) => parseInt(v)}>
                            {(surgeonState) => (
                              <Grid item xs={6}>
                                <FormControl sx={styles.formControl}>
                                  <InputLabel htmlFor="surgeon">Surgeon</InputLabel>
                                  <Select
                                    native
                                    {...surgeonState.input}
                                    input={<Input id="surgeon" />}
                                  >
                                    <option aria-label="None" value="" />
                                    {(
                                      specialtyOptions.find(
                                        (spec) => spec.id == specialtyState.input.value
                                      )?.surgeons ?? []
                                    ).map(({ id, firstName, lastName }) => (
                                      <option key={id} value={id}>
                                        {firstName} {lastName}
                                      </option>
                                    ))}
                                  </Select>
                                </FormControl>
                              </Grid>
                            )}
                          </Field>
                        </>
                      )
                    }}
                  </Field>

                  <Grid item xs={12}>
                    <Divider />
                  </Grid>
                  <Field name="day" parse={(v) => formatISO(v).slice(0, 10)}>
                    {(dayState) => (
                      <Grid item xs={4}>
                        <FormControl sx={styles.formControl}>
                          <DatePicker
                            label="Date"
                            renderInput={(props) => <TextField {...props} />}
                            {...dayState.input}
                            inputFormat="dd/MM/yyyy"
                          />
                        </FormControl>
                      </Grid>
                    )}
                  </Field>
                  <Field name="sessionTypeId">
                    {(sessionTypeState) => (
                      <Grid item xs={4}>
                        <FormControl sx={styles.formControl}>
                          <InputLabel htmlFor="demo-dialog-native">Session</InputLabel>
                          <Select
                            native
                            {...sessionTypeState.input}
                            input={<Input id="session-input" />}
                          >
                            {sessionTypes.map(({ id, name }) => (
                              <option key={id} value={id}>
                                {name}
                              </option>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    )}
                  </Field>
                  <Field name="theatreId">
                    {(sessionTypeState) => (
                      <Grid item xs={4}>
                        <FormControl sx={styles.formControl}>
                          <InputLabel htmlFor="theatreId-input">Location</InputLabel>
                          <Select
                            native
                            {...sessionTypeState.input}
                            input={<Input id="theatreId-input" />}
                          >
                            <option aria-label="None" value="" />
                            {theatres.map(([id, name]) => (
                              <option key={id} value={id}>
                                {name}
                              </option>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    )}
                  </Field>
                </Grid>
              </form>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => resetList(null)} color="primary">
                Cancel
              </Button>
              <Button onClick={formState.handleSubmit} color="primary">
                Ok
              </Button>
            </DialogActions>
          </>
        )}
      </Form>
    </Dialog>
  )
}
