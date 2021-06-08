import { Dialog, DialogTitle, List, ListItem, ListItemText, makeStyles } from "@material-ui/core";
import React, { ReactElement, ReactNode } from 'react'
export interface PopupDialogProps {
    popupState: SetPopupState;
    setPopupState: (newState: SetPopupState | null) => void;
}
const useStyles = makeStyles((props) => ({}))
interface SetPopupState {
    resolve: (key: string) => void;
    reject: (err?: Error) => void;
    content:ReactNode
    title:string
}
export function requestDialog(
    setter: (popupState:SetPopupState)=>void,
    options: Map<string, string>,
    title:string
): Promise<string> {
    return new Promise((resolve, reject) => {
        const content=<List>
            {Array.from(options.entries(), ([key, text]) => (
                <ListItem button onClick={() => { setter(null);resolve(key) }} key={key}>
                    <ListItemText primary={text} />
                </ListItem>
            ))}
        </List>
        setter({resolve, reject, content,title })
    })    
     }
export function PopupDialog(props: PopupDialogProps):ReactElement {
    const classes = useStyles();
    const { popupState,setPopupState } = props;

    const handleClose = () => {
        setPopupState(null)
        popupState.reject();
    };

    const handleListItemClick = (value: string) => {
        setPopupState(null)
        popupState.resolve(value);
    };

    return popupState && (
        <Dialog onClose={handleClose} aria-labelledby="simple-dialog-title" open={true}>
            <DialogTitle id="simple-dialog-title">{ popupState.title}</DialogTitle>
            {popupState.content}
        </Dialog>
    );
}