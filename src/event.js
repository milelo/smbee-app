import update from 'immutability-helper'; //https://github.com/kolodny/immutability-helper
import './program'
import util from './util'

// eslint-disable-next-line
const dbg = util.debug('event')
// eslint-disable-next-line
const dbgx = util.debugx

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

const flashShift = {
  fast: 0,
  medium: 1,
  slow: 2,
  vSlow: 3,
  vvSlow: 5
}

function ledBrightness(prevState, ledId) {
  const { engine, leds } = prevState
  const { flashRate, antiPhase, brightness } = leds[ledId]
  const shift = flashShift[flashRate]
  return shift != null ? WAVEFORM[((engine.ticks >>> shift) & 0xF) + (antiPhase ? 0x8 : 0)] : brightness
}

function updateLedBrightness(prevState) {
  const { ledIds } = prevState
  return ledIds.reduce((prevState, ledId) =>
    update(prevState, { leds: { [ledId]: { brightness: { $set: ledBrightness(prevState, ledId) } } } }), prevState)
}

function incTick(prevState) {
  const state = update(prevState, { engine: { ticks: { $apply: x => x + 1 } } })
  return updateLedBrightness(state)
}

function showLeds(prevState, { ledBrightnessUpdate }) {
  //dbg('prevState', prevState['leds'],'string')
  //dbg('ledBrightnessUpdate', ledBrightnessUpdate, 'string')
  dispatchAsync({ f: 'nextStep' })
  const newState = update(prevState, { leds: ledBrightnessUpdate })
  //dbg('newState', newState['leds'], 'string')
  return newState
}

function wait(prevState, { timems }) {
  dispatchAsync({ f: 'nextStep' }, timems)
  return prevState
}

const tickInterval_ms = 4

let runningTimerHandle
function toggleRunning(prevState) {
  const wasRunning = prevState.engine.running
  if (wasRunning) {
    clearInterval(runningTimerHandle)
  } else {
    runningTimerHandle = setInterval(() => dispatch({ f: 'incTick' }), tickInterval_ms)
    dispatchAsync({ f: 'nextStep' })
  }
  return update(prevState, { engine: { running: { $set: !wasRunning } } })
}

function nextStep(prevState) {
  const { engine, program } = prevState
  const { pc, running } = engine
  const step = program[pc]
  //dbg('nextStep...; running', running)
  if (running) {
    //execute step
    dispatchAsync(step)
  }
  const pcNew = running ? pc + 1 : 0
  return update(prevState, { engine: { pc: { $set: pcNew === program.length ? 0 : pcNew } } })
}

event.reducer = function (prevState, action) {
  //execute the function matching id with parameters (prevState, action)
  //return eval(action.f)(prevState, action)//harmful?
  const f = {
    setView: setView,
    setMenu: setMenu,
    toggleRunning: toggleRunning,
    incTick: incTick,
    nextStep: nextStep,
    showLeds: showLeds,
    wait: wait,
  }[action.f]
  if (f) {
    return f(prevState, action)
  } else {
    throw new Error("Unknown dispatch function: " + action.f)
  }
}

let dispatchAsync //Local dispatch function. Support dispatch from timeout to avoid dispatch before return
let dispatch //Local dispatch function

//let dispatcherAsync 

event.getDispatcher = function (dispatch1) {
  dispatch = dispatch1
  dispatchAsync = (data, delayms = 0) => setTimeout(() => dispatch(data), delayms)
  // dispatcherAsync = {
  //   nextStep: () => dispatchAsync({ f: 'nextStep' }),
  //   incTick: () => dispatchAsync({ f: 'incTick' })
  // }
  return {
    homeView: () => dispatch({ f: 'setView', view: 'home' }),
    sequenceView: () => dispatch({ f: 'setView', view: 'sequence' }),

    openMenu: () => dispatch({ f: 'setMenu', open: true }),
    closeMenu: () => dispatch({ f: 'setMenu', open: false }),

    ledBrightness: (ledId, brightness) => dispatch({ f: 'setLed', ledId: ledId, brightness: brightness, enable: true }),
    toggleRunning: () => dispatch({ f: 'toggleRunning' }),
    dispatch: dispatch
  }
}

