import React from 'react';
import Head from 'next/head';
import Link from 'next/link'
import { ThemeProvider} from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import theme from '../components/theme'
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import {useRouter} from 'next/router'
import {
  AppBar,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  makeStyles,
  Switch,
  Toolbar,
  Typography,
} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import EditIcon from "@material-ui/icons/Edit";
import { CalendarToday, DateRange, EventBusy, Mail } from "@material-ui/icons";
import { Observer, useLocalObservable } from 'mobx-react-lite';
import { action, observable } from 'mobx';
import { SettingsContext } from '../components/context';
import { createViewModel } from 'mobx-utils';
import { startOfToday, startOfTomorrow } from 'date-fns';
const useStyles = makeStyles({
  drawer: {
    width: "20em",
  },
  container: {
    padding: "1em",
  },
});

const allDuties = observable.array([
  {
    id: 100,
    location: "EmgTh",
    dutyDay:startOfToday(),
    startTime: 8,
    duration:24,
    staffName: "Emergencies",
    staffLevel: null,
    staffGroup: "theatreDescription",
  },
  
  {
    id: 0,
    location: "EmgTh",
    dutyDay:startOfToday(),
    startTime: 8,
    duration:10,
    staffName: "Joe Bloggs",
    staffLevel: "ST5",
    staffGroup: "higher",
  },
  {
    id: 1,
    location: "EmgTh",
    dutyDay: startOfTomorrow(), 
    startTime:13,
    duration:5,
    staffName: "Fred Bloggs",
    staffLevel: "CT1",
    staffGroup: "core",
  },
]);

const theatreNames = [
  { shortName: "EmgTh", theatreName: "Emergency Theatre" },
  { shortName: "ICU", theatreName: "ICU" },
  { shortName: "Th1", theatreName: "Theatre 1" },
];

export default function MyApp(props) {
  const { Component, pageProps } = props;
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const settings=useLocalObservable(()=>({
    editMode: false,
    data: allDuties.map(createViewModel),
    theatreNames
  }))
  const toggleEdit = action(() => {
    if (settings.editMode) {
      if (settings.data.some(d => d.isDirty)) {
        console.log('unsaved data!')
      }
      settings.data.forEach(d=>d.reset())
      settings.editMode = false
      return
    }
    settings.editMode = true
  })
  const classes = useStyles();
  const router=useRouter()

  React.useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);
  React.useEffect(()=>{
    const callback=()=>setDrawerOpen(false)
    router.events.on('routeChangeComplete',callback)
    return ()=>router.events.off('routeChangeComplete',callback)
  },[])
  
  return (
    <React.Fragment>
      <SettingsContext.Provider value={settings}>
      <Head>
        <title>{Component.pageTitle}</title>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
      </Head>
      <ThemeProvider theme={theme}>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        <div>
      <AppBar>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h5">{Component.pageTitle}</Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <List className={classes.drawer}>
        <Link href="/">
          <ListItem button>
            <ListItemIcon>
              <DateRange/>
            </ListItemIcon>
            <ListItemText primary="This week" />
          </ListItem>
          </Link>
          <Link href="/requestleave">
          <ListItem button>
            <ListItemIcon>
              <EventBusy/>
            </ListItemIcon>
            <ListItemText primary="Request leave" />
          </ListItem>
          </Link>
          <Link href="/viewduties">
            <ListItem button>
            <ListItemIcon>
              <CalendarToday />
            </ListItemIcon>
            <ListItemText primary="View duties" />
          </ListItem></Link>
          <Link href="/messaging">
          <ListItem button>
            <ListItemIcon>
              <Mail/>
            </ListItemIcon>
            <ListItemText primary="Messaging" />
          </ListItem>
        </Link>
        <ListItem button onClick={toggleEdit}>
            <ListItemIcon>
              <EditIcon />
            </ListItemIcon>
            <ListItemText primary="Edit mode" />
            <ListItemSecondaryAction>
              <Observer>{()=>(
              <Switch
                checked={settings.editMode}
                onChange={toggleEdit}
              />)}</Observer>
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </Drawer>
      <Toolbar />
      <Component {...pageProps} />
    </div>
        
        </MuiPickersUtilsProvider>
      </ThemeProvider>
      </SettingsContext.Provider>
    </React.Fragment>
  );
}


