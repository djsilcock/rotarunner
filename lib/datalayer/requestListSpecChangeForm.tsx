import React from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import DialogContent from '@material-ui/core/DialogContent';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { useLocalObservable,observer } from 'mobx-react-lite';
import { reaction } from 'mobx';

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

interface RequestListSpecChangeFormStateProp{
specialty: string
    setSpecialty:(val:string)=>void
    surgeon: string;
    specialtyId: string;
    surgeonId:string|number
    setSurgeon: (val: string) => void;
    specialtyOptions:[string,string][]
    surgeonOptions: Map<string,string>
}
    

export const RequestListSpecChangeForm=observer(function RequestListSpecChangeForm({state}:{state:RequestListSpecChangeFormStateProp}) {
    const classes = useStyles();
    console.log(state)
    
    const handleSpecialtyChange = (event: React.ChangeEvent<{ value: string }>) => {
        state.setSpecialty(event.target.value)
    };
    const handleSurgeonChange = (event: React.ChangeEvent<{ value: string }>) => {
        state.setSurgeon(event.target.value)
    };

    return (      
                <DialogContent>
                    <form className={classes.container}>
                        <FormControl className={classes.formControl}>
                            <InputLabel htmlFor="demo-dialog-native">Specialty</InputLabel>
                            <Select
                                native
                                value={state.specialtyId}
                                onChange={handleSpecialtyChange}
                                input={<Input id="demo-dialog-native" />}
                            >
                        <option aria-label="None" value="" />
                        {state.specialtyOptions.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
                        </Select>
                </FormControl>
                <FormControl className={classes.formControl}>
                    <InputLabel htmlFor="demo-dialog-native">Surgeon</InputLabel>
                    <Select
                        native
                        value={state.surgeonId}
                        onChange={handleSurgeonChange}
                        input={<Input id="demo-dialog-native" />}
                    >
                        <option aria-label="None" value="" />
                        {Array.from(state.surgeonOptions.entries(),([id, name]) => <option key={id} value={id}>{name}</option>)}
                    </Select>
                </FormControl>
                    </form>
                </DialogContent>
        
    );
})