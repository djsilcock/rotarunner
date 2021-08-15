import React, { ReactElement } from "react"
import { Theme } from "@material-ui/core/styles"
import createStyles from "@material-ui/styles/createStyles"
import makeStyles from "@material-ui/styles/makeStyles"
import Button from "@material-ui/core/Button"
import Dialog from "@material-ui/core/Dialog"
import DialogActions from "@material-ui/core/DialogActions"
import DialogContent from "@material-ui/core/DialogContent"
import DialogTitle from "@material-ui/core/DialogTitle"

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      display: "flex",
      flexWrap: "wrap",
    },
    formControl: {
      margin: theme.spacing(1),
      minWidth: 120,
    },
  })
)

interface PopupDialogStateContent {
  onSubmit: (returnval: unknown) => void
  onError: (error: string | Error) => void
  initialValues
  content: ReactElement
}

export type PopupDialogState = PopupDialogStateContent | null

export function PopupDialog({ state }: { state: PopupDialogState }): ReactElement | null {
  return (
    <Dialog disableEscapeKeyDown open={!!state} onClose={handleCancel}>
      {!!state &&
        React.cloneElement(state.content, {
          onSubmit: state.onSubmit,
          initialValues: state.initialValues,
          onError: state.onError,
          handleCancel,
        })}
    </Dialog>
  )
}
