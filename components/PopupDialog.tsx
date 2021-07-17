import React, { ReactElement } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        container: {
            display: 'flex',
            flexWrap: 'wrap',
        },
        formControl: {
            margin: theme.spacing(1),
            minWidth: 120,
        },
    }),
);

export interface PopupDialogState{
    callback: (error:string,returnval: boolean) => void
    content: ReactElement
    title:string
}
export function PopupDialog({state}:{state:PopupDialogState}):ReactElement {
    
    const handleCancel = () => {
        state.callback?.(null,false)
    };
    const handleOk = () => {
        state.callback?.(null,true)
    }

    return (
        <div>
            <Dialog disableBackdropClick disableEscapeKeyDown open={Boolean(state.content)} onClose={handleCancel}>
                <DialogTitle>{state.title}</DialogTitle>
                <DialogContent>
                    {state.content}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancel} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleOk} color="primary">
                        Ok
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}