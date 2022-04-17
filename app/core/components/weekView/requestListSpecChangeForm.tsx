import React, { useCallback,Suspense } from "react"
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
  Tooltip,
  FormHelperText,
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
import { Field, Form, useField, useForm } from "react-final-form"
import arrayMutators, { update } from "final-form-arrays"
import { TheatreList } from "db"
import { formatISO } from "date-fns"
import { Add, Close, Delete } from "@material-ui/icons"
import { TheatreListExt } from "./Duty"
import { useGetClashes } from "./useGetClashes"
import getOtherDutiesToday from "./queries/getOtherDutiesToday"

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
  listToChange,
  resetList,
}: {
  listToChange: Partial<TheatreListExt> | null
  resetList: (newvalue) => void
}) {
  const [specialtyOptions] = useQuery(getSurgeonsAndSpecialties, {})
  const [theatres] = useQuery(getTheatres, {})
  const [sessionTypes] = useQuery(getSessionTypes, {})
  const initialValues = listToChange
  const [changeList] = useMutation(modifyList)
  React.useEffect(() => {
    console.log({ initialValues })
  }, [initialValues])
  const executeCreate = (list) => changeList({ list, action: "create" })
  const executeModify = (changes) =>
    changeList({
      list: initialValues!,
      action: "modify",
      changes,
    })

  const executeChange = (data) =>
    (initialValues?.id ? executeModify(data) : executeCreate(data))
      .then((results) => {
        invalidateQuery(getListsForWeek)
        invalidateQuery(getOtherDutiesToday)
      })
      .then(() => console.log("submitted"))
      .then(() => resetList(null))
      .catch((e) => console.log("Error!", e))

  const handleClose = (evt, reason) => {
    if (reason != "backdropClick") resetList(null)
  }

  return (
    <Dialog open={listToChange != null} onClose={handleClose}>
      <DialogTitle>Modify list</DialogTitle>
      <Form
        onSubmit={executeChange}
        initialValues={initialValues as TheatreList}
        mutators={{ ...arrayMutators }}
      >
        {(formState) => {
          return (
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
                        options={sessionTypes.map(({ session: { id, name } }) => [id, name])}
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
                        ).map(({ id, firstName, lastName }) => [
                          `${id}`,
                          `${firstName} ${lastName}`,
                        ])}
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
                          <Suspense key={i} fallback='...'>
                          <StaffMemberRow i={i} sessionTypes={sessionTypes} />
                          </Suspense>
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
          )
        }}
      </Form>
    </Dialog>
  )
}
function StaffMemberRow({ i, sessionTypes}) {
  const form = useForm()
  const { sessionTypeId: globalSessTypeId, theatreId, day } = form.getState().values || {}
  const globalSessType = sessionTypes.find((s) => s.session.id == globalSessTypeId)
  const allDuties = form.getState().values.duties
  const getClashes = useGetClashes(theatreId, day, sessionTypes)
  const staffMembersInPlay = React.useMemo(
    () => (allDuties || []).filter((_, idx) => idx != i),
    [allDuties, i]
  )
  const nameField = useField(`duties[${i}].staffMemberId`)
  const sessTypeField = useField(
    `duties[${i}].sessionTypeId` , {
    validate: (v, allvalues) => {
      if (!allvalues) return undefined
      const { sessionTypeId } = allvalues
      if (!sessionTypeId) return undefined
      const gst = sessionTypes.find((s) => s.session.id == sessionTypeId)
      if (gst.contains.includes(v)) return undefined
      return `Not part of ${gst.session.name}`
    }
    }
  )


  const [staffMembers] = useQuery(getStaff, {})

  const removeMe = useCallback(() => {
    form.mutators!.remove!("duties", i)
  }, [form, i])
  return (
    <TableRow key={i}>
      <TableCell>
        <Button onClick={removeMe}>
          <Delete />
        </Button>
      </TableCell>

      <TableCell>
        <FormControl sx={styles.formControl}>
          <Select {...nameField.input} input={<Input id="session-input" />}>
            {staffMembers.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                <Tooltip placement='right' title={<><div>Grade</div><div>{getClashes(s.id,globalSessTypeId)}</div></>}>
                <div>{`${s.firstName} ${s.lastName} ${getClashes(s.id,globalSessTypeId)[0]?'⚠️':''}`}</div>
                </Tooltip>
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>{getClashes(nameField.input.value,sessTypeField.input.value)}&nbsp;</FormHelperText>
        </FormControl>
      </TableCell>
      <TableCell>
        <FormControl sx={styles.formControl} error={!!sessTypeField.meta.error}>
          <Select {...sessTypeField.input} input={<Input id="session-input" />}>
            <MenuItem key="session" value="session">
              Session
            </MenuItem>
            {sessionTypes.map(({ session: { id, name } }) => (
              <MenuItem disabled={!globalSessType.contains.includes(id)} key={id} value={id}>
                {name}{" "}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>{sessTypeField.meta.error}&nbsp;</FormHelperText>
        </FormControl>
      </TableCell>
    </TableRow>
  )
}

