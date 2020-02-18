import update from 'immutability-helper'; //https://github.com/kolodny/immutability-helper
//import engine, { FLASH_SLOW } from './engine'

//const engine = new engine();
//define event as the namespace
let event = {}
export default event

const WAVEFORM = new Uint8Array(
//  [0, 32, 64, 96, 128, 160, 192, 224, 255, 224, 192, 160, 128, 96, 64, 32],//triangle
  [0, 50, 98, 142, 180, 212, 236, 250, 255, 250, 236, 212, 180, 142, 98, 50],// rectified sine
)

const setMenu = (prevState, { open }) =>
  update(prevState, { menuPane: { open: { $set: open } } })

const setView = (prevState, { view }) =>
  update(setMenu(prevState, { open: false }), { view: { $set: view } })

const setLed = (prevState, { ledId, brightness, enable }) =>
  update(prevState, {
    leds: {
      [ledId]: {
        brightness: { $set: brightness },
        enable: { $set: enable }
      }
    }
  })

const toggleLed = (prevState, { ledId }) =>
  update(prevState, { leds: { [ledId]: { enable: { $apply: e => e = !e } } } })

// eslint-disable-next-line
function debug(m, r) {
  console.log(m ? m + ": " + r : r)
  return r
}

let timerID
const startFlashing = (prevState, { toggle }) => {
  timerID = prevState.flashing ? timerID : setInterval(toggle, 1000)
  return update(prevState, { flashing: { $set: true } })
}

const stopFlashing = (prevState) => {
  clearInterval(timerID)
  return update(prevState, { flashing: { $set: false } })
}

const tickInterval_ms = 4

let runningTimerHandle
function toggleRunning(prevState, { dispatch }) {
  const wasRunning = prevState.running
  if (wasRunning) {
    clearInterval(runningTimerHandle)
  } else {
    runningTimerHandle = setInterval(() => dispatch({ f: 'incTick' }), tickInterval_ms)
  }
  return update(prevState, { running: { $set: !wasRunning } })
}

const flashShift = {
  fast: 0,
  medium: 1,
  slow: 2,
  vSlow: 3,
  vvSlow: 5
}

function ledBrightness(prevState, ledId) {
  const { ticks, leds } = prevState
  const { flashRate, antiPhase, brightness } = leds[ledId]
  const shift = flashShift[flashRate]
  return shift != null ? WAVEFORM[((ticks >> shift) & 0xF) + (antiPhase ? 0x8 : 0)] : brightness
}

function updateLedBrightness(prevState) {
  const { ledIds } = prevState
  return ledIds.reduce((prevState, ledId) =>
    update(prevState, { leds: { [ledId]: { brightness: { $set: ledBrightness(prevState, ledId) } } } }), prevState)
}

function incTick(prevState) {
  const state = update(prevState, { ticks: { $apply: x => x + 1 } })
  return updateLedBrightness(state)
}

event.reducer = function (prevState, action) {
  //execute the function matching id with parameters (prevState, action)
  //return eval(action.f)(prevState, action)//harmful?
  const f = {
    setView: setView,
    setMenu: setMenu,
    startFlashing: startFlashing,
    stopFlashing: stopFlashing,
    setLed: setLed,
    toggleLed: toggleLed,
    toggleRunning: toggleRunning,
    incTick: incTick,
  }[action.f]
  if (f) {
    return f(prevState, action)
  } else {
    throw new Error("Unknown dispatch function: " + action.f)
  }
}

event.getDispatcher = function (dispatch) {
  return {
    homeView: () => dispatch({ f: 'setView', view: 'home' }),
    sequenceView: () => dispatch({ f: 'setView', view: 'sequence' }),

    openMenu: () => dispatch({ f: 'setMenu', open: true }),
    closeMenu: () => dispatch({ f: 'setMenu', open: false }),

    startFlashing: () => dispatch(
      { f: 'startFlashing', toggle: () => dispatch({ f: 'toggleLed', ledId: 'sting' }) }),
    stopFlashing: () => dispatch({ f: 'stopFlashing' }),
    ledOn: (ledId) => dispatch({ f: 'setLed', ledId: ledId, enable: true, brightness: 100 }),
    ledOff: (ledId) => dispatch({ f: 'setLed', ledId: ledId, enable: false }),
    ledBrightness: (ledId, brightness) => dispatch({ f: 'setLed', ledId: ledId, brightness: brightness, enable: true }),
    toggleLed: (ledId) => dispatch({ f: 'toggleLed', ledId: ledId }),
    toggleRunning: () => dispatch({ f: 'toggleRunning', dispatch: dispatch }),
  }
}

event.initialState =
{
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
  running: false,
  flashing: false,
  //program: [{ f: engine.EYES }, {}],
  ticks: 0,
}
