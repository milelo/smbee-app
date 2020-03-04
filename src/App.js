import 'typeface-roboto';
import React, { /*useEffect,*/ useReducer } from 'react';
//import Dispatcher from './event'
import event from './event'
import './App.css';
import {program} from './program';
//import Container from '@material-ui/core/Container';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Drawer from '@material-ui/core/Drawer';
//import Typography from '@material-ui/core/Typography';
//import Box from '@material-ui/core/Box';
//
import AppBar from './AppBar'
import MainMenu from './MainMenu';
import SvgSmBee from './svg-bee'

const theme = createMuiTheme();

function App() {
  const [state, dispatch] = useReducer(event.reducer, getInitialState());
  const dispatcher = event.getDispatcher(dispatch)
  const context = {
    dispatch: dispatch,
    dispatcher: dispatcher
  }

  // useEffect(() => {
  //   dispatcher.startFlashing()
  // }, [state.flashing, dispatcher])

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar title="SMBee" running={state.engine.running} {...context} />
      <MenuPane {...state.menuPane} {...context} >
        <MainMenu {...context} />
      </MenuPane>
      {{
        home: <MainView {...state} {...context} />,
        sequence: <SequenceView {...state} {...context} />,
      }[state.view]}
    </MuiThemeProvider>
  );
}

function MenuPane({ open, dispatcher, children }) {
  return (
    <Drawer open={open} onClose={dispatcher.closeMenu}>
      {children}
    </Drawer>)
}

function MainView({ leds }) {
  return (
    <div>
      <SvgSmBee leds={leds} />
      <a
        className="App-link"
        href="https://milelo.github.io/smbee/"
        target="_blank"
        rel="noopener noreferrer"
      >SMBee</a>
    </div>
  )
}

function SequenceView(props) {
  return <h1>Sequence View</h1>
}

//console.log(program)

const getInitialState = () => Object.assign(initialState, {program: program})

const initialState = {
  leds: {
    rightEye: {
      color: "yellow",
      enable: true,
      flashRate: 'vSlow',
      brightness: 100,
    },
    leftEye: {
      color: "yellow",
      enable: true,
      flashRate: 'vSlow',
      brightness: 100,
    },
    rightAntennae: {
      color: "blue",
      enable: true,
      flashRate: 'vSlow',
      antiPhase: true,
      brightness: 100,
    },
    leftAntennae: {
      color: "blue",
      enable: true,
      flashRate: 'vSlow',
      brightness: 100,
    },
    sting: {
      color: "red",
      enable: true,
      flashRate: 'medium',
      brightness: 100,
    }
  },
  ledIds: ['leftEye', 'rightEye', 'leftAntennae', 'rightAntennae', 'sting'],
  menuPane: {
    open: false
  },
  view: 'home',
  engine: {
    running: false,
    ticks: 0,
    pc: 0,
  }
}

export default App;
