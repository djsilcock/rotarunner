import {
  AppProps,
  ErrorBoundary,
  ErrorComponent,
  AuthenticationError,
  AuthorizationError,
  ErrorFallbackProps,
  useQueryErrorResetBoundary,
  BlitzComponentType,
  BlitzPage,
  Link,
  Head,
  useRouter,
  useSession,
  useMutation,
  invalidateQuery,
} from "blitz"

import LoginForm from "app/auth/components/LoginForm"
import CssBaseline from "@material-ui/core/CssBaseline"
import { ThemeProvider, Theme, StyledEngineProvider } from "@material-ui/core/styles"
import React, { Suspense } from "react"
import theme from "../core/components/theme"
import AdapterDateFns from "@material-ui/lab/AdapterDateFns"
import LocalizationProvider from "@material-ui/lab/LocalizationProvider"

import {
  AppBar,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Switch,
  Toolbar,
  Typography,
} from "@material-ui/core"
import makeStyles from "@material-ui/styles/makeStyles"
import MenuIcon from "@material-ui/icons/Menu"
import EditIcon from "@material-ui/icons/Edit"
import { CalendarToday, DateRange, EventBusy, Mail } from "@material-ui/icons"
import { Observer, useLocalObservable } from "mobx-react-lite"
import { action } from "mobx"
import { SettingsContext } from "../core/components/context"
import switchBranch from "app/core/mutations/setEditMode"
import getListsForTheatreDay from "app/core/components/weekView/queries/getListsForTheatreDay"

declare module "@material-ui/styles/defaultTheme" {
  interface DefaultTheme extends Theme {}
}

type AppPropsWithTitle = {
  Component: (BlitzComponentType & BlitzPage) & { pageTitle: string }
  pageProps
}

function EditModeSwitchInner() {
  const currentBranch = useSession().branch || "public"
  const [setBranchMutation] = useMutation(switchBranch)
  const setCurrentBranch = (branch) => setBranchMutation({ branch })
  const toggleEdit = () => {
    if (currentBranch == "public") {
      setCurrentBranch("draft").then(() => invalidateQuery(getListsForTheatreDay))
    } else {
      setCurrentBranch("public").then(() => invalidateQuery(getListsForTheatreDay))
    }
  }
  return (
    <ListItem button onClick={toggleEdit}>
      <ListItemIcon>
        <EditIcon />
      </ListItemIcon>
      <ListItemText primary="Edit mode" />
      <ListItemSecondaryAction>
        <Switch checked={currentBranch !== "public"} onChange={toggleEdit} />
      </ListItemSecondaryAction>
    </ListItem>
  )
}
function EditModeSwitch() {
  return (
    <Suspense fallback="...">
      <EditModeSwitchInner />
    </Suspense>
  )
}

export default function App({ Component, pageProps }: AppPropsWithTitle) {
  const getLayout = Component.getLayout || ((page) => page)
  const [drawerOpen, setDrawerOpen] = React.useState(false)

  const classes = useStyles()
  const router = useRouter()

  React.useEffect(() => {
    const callback = () => setDrawerOpen(false)
    router.events.on("routeChangeComplete", callback)
    return () => router.events.off("routeChangeComplete", callback)
  }, [router])
  console.log("re-rendering App")
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline />

        <React.Fragment>
          <Head>
            <title>{Component.pageTitle}</title>
            <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
          </Head>
          <StyledEngineProvider injectFirst>
            <ThemeProvider theme={theme}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
                <CssBaseline />
                <div>
                  <AppBar>
                    <Toolbar>
                      <IconButton
                        edge="start"
                        color="inherit"
                        onClick={() => setDrawerOpen(true)}
                        size="large"
                      >
                        <MenuIcon />
                      </IconButton>
                      <Typography variant="h5">{Component.pageTitle}</Typography>
                    </Toolbar>
                  </AppBar>
                  <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
                    <List className={classes.drawer}>
                      <Link href="/">
                        <ListItem button>
                          <ListItemIcon>
                            <DateRange />
                          </ListItemIcon>
                          <ListItemText primary="This week" />
                        </ListItem>
                      </Link>
                      <Link href="/requestleave">
                        <ListItem button>
                          <ListItemIcon>
                            <EventBusy />
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
                        </ListItem>
                      </Link>
                      <Link href="/messaging">
                        <ListItem button>
                          <ListItemIcon>
                            <Mail />
                          </ListItemIcon>
                          <ListItemText primary="Messaging" />
                        </ListItem>
                      </Link>
                      <EditModeSwitch />
                    </List>
                  </Drawer>
                  <Toolbar />

                  <ErrorBoundary
                    FallbackComponent={RootErrorFallback}
                    onReset={useQueryErrorResetBoundary().reset}
                  >
                    {getLayout(<Component {...pageProps} />)}
                  </ErrorBoundary>
                </div>
              </LocalizationProvider>
            </ThemeProvider>
          </StyledEngineProvider>
        </React.Fragment>
      </ThemeProvider>
    </StyledEngineProvider>
  )
}

function RootErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  if (error instanceof AuthenticationError) {
    return <LoginForm onSuccess={resetErrorBoundary} />
  } else if (error instanceof AuthorizationError) {
    return (
      <ErrorComponent
        statusCode={error.statusCode}
        title="Sorry, you are not authorized to access this"
      />
    )
  } else {
    return (
      <ErrorComponent statusCode={error.statusCode || 400} title={error.message || error.name} />
    )
  }
}

const useStyles = makeStyles({
  drawer: {
    width: "20em",
  },
  container: {
    padding: "1em",
  },
})
