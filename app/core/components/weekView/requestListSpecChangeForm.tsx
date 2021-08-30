import React from "react"
import InputLabel from "@material-ui/core/InputLabel"
import Input from "@material-ui/core/Input"
import MenuItem from "@material-ui/core/MenuItem"
import {
  FormControl,
  Box,
  Divider,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@material-ui/core"
import Select, { SelectChangeEvent } from "@material-ui/core/Select"
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Grid,
  Autocomplete,
} from "@material-ui/core"
import { useQuery, useMutation, invalidateQuery } from "blitz"
import getSurgeonsAndSpecialties from "./queries/getSurgeonsAndSpecialties"
import getSessionTypes from "./queries/getSessionTypes"
import getListInfo from "./queries/getListInfo"
import getStaff from "./queries/getAllStaff"
import modifyList from "./mutations/modifyList"
import getListsForWeek from "./queries/getListsForWeek"

import getTheatres from "./queries/getTheatres"
import { DatePicker } from "@material-ui/lab"
import { Field, Form } from "react-final-form"
import arrayMutators, { update } from "final-form-arrays"
import { TheatreList } from "db"
import { formatISO } from "date-fns"
import { Add, Close, Delete } from "@material-ui/icons"

const styles = {
  container: {
    display: "flex",
    flexWrap: "wrap",
  },
  formControl: {
    margin: (theme) => theme.spacing(1),
    minWidth: 120,
    width: "85%",
  },
}

function DropdownField({
  name,
  options,
  label,
}: {
  name: string
  options: [id: string, label: string][]
  label?: string
}) {
  return (
    <Field name={name}>
      {(fieldState) => (
        <FormControl sx={styles.formControl}>
          {label && <InputLabel htmlFor="demo-dialog-native">{label}</InputLabel>}
          <Select {...fieldState.input} input={<Input id="session-input" />}>
            {options.map(([id, name]) => (
              <MenuItem key={id} value={id}>
                {name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    </Field>
  )
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
  const [staffMembers] = useQuery(getStaff, {})
  const [initialValues] = useQuery(getListInfo, { id: id! }, { enabled: id != null })
  const [changeList] = useMutation(modifyList)
  React.useEffect(() => {
    console.log({ initialValues, sessionTypes })
  }, [initialValues, sessionTypes])
  const executeChange = (changes) =>
    changeList({
      list: initialValues!,
      action: "modify",
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
      <Form
        onSubmit={executeChange}
        initialValues={initialValues as TheatreList}
        mutators={{ ...arrayMutators }}
      >
        {(formState) => (
          <>
            <DialogContent>
              <form>
                <Grid container rowSpacing={2}>
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
                  <Grid item xs={4}>
                    <DropdownField
                      name="sessionTypeId"
                      label="session"
                      options={sessionTypes.map(({ id, name }) => [id, name])}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <DropdownField name="theatreId" label="Location" options={theatres} />
                  </Grid>

                  <Grid item xs={12}>
                    <Divider />
                  </Grid>
                  <Grid item xs={6}>
                    <DropdownField
                      name="specialtyId"
                      label="Specialty"
                      options={specialtyOptions.map(({ id, name }) => [id, name])}
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <DropdownField
                      name="surgeonId"
                      label="Surgeon"
                      options={(
                        specialtyOptions.find(
                          (spec) => spec.id == formState.form.getState()?.values?.specialtyId
                        )?.surgeons ?? []
                      ).map(({ id, firstName, lastName }) => [`${id}`, `${firstName} ${lastName}`])}
                    />
                  </Grid>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell />
                        <TableCell sx={{ textAlign: "center" }}>Staff Member</TableCell>
                        <TableCell sx={{ textAlign: "center" }}>Duty</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {formState.form.getState().values?.duties?.map((v, i) => (
                        <TableRow key={v}>
                          <TableCell>
                            <Button
                              onClick={() => {
                                formState.form.mutators!.remove!("duties", i)
                              }}
                            >
                              <Delete />
                            </Button>
                          </TableCell>

                          <TableCell>
                            <DropdownField
                              name={`duties[${i}].staffMemberId`}
                              options={staffMembers.map((s) => [
                                "" + s.id,
                                `${s.firstName} ${s.lastName}`,
                              ])}
                            />
                          </TableCell>
                          <TableCell>
                            <DropdownField
                              name={`duties[${i}].sessionTypeId`}
                              options={sessionTypes.map(({ id, name }) => [id, name])}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <Button
                    onClick={() =>
                      formState.form.mutators!.push!("duties", {
                        staffMemberId: undefined,
                        sessionTypeId: formState.form.getState().values.sessionTypeId,
                      })
                    }
                  >
                    <Add />
                    Add people...
                  </Button>
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
