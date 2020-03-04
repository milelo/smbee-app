import update from 'immutability-helper'; //https://github.com/kolodny/immutability-helper
import './program'
import util from './util'

// eslint-disable-next-line
const dbg = util.dbg
// eslint-disable-next-line
const dbgx = util.dbgx

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
  const state = update(prevState, {engine: { ticks: { $apply: x => x + 1 } }})
  return updateLedBrightness(state)
}

function showLeds(prevState, {ledBrightnessUpdate}) {
  //dbg('prevState', prevState['leds'],'string')
  //dbg('ledBrightnessUpdate', ledBrightnessUpdate, 'string')
  dispatch({f: 'nextStep'})
  const newState = update(prevState, {leds: ledBrightnessUpdate})
  //dbg('newState', newState['leds'], 'string')
  return newState
}

function wait(prevState, {timems}) {
  dispatch({f: 'nextStep'}, timems)
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
     dispatch({f: 'nextStep'})
  }
  return update(prevState, {engine: { running: { $set: !wasRunning } }})
}

function nextStep(prevState) {
  const {engine, program} = prevState
  const {pc, running} = engine
  const step = program[pc]
  //dbg('nextStep...; running', running)
  if (running) {
    //execute step
    dispatch(step)
  }
  const pcNew = running? pc + 1: 0
  return update(prevState, {engine: {pc: {$set: pcNew === program.length? 0: pcNew}}})
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

let dispatch //dispatch function

event.getDispatcher = function (rdispatch) {
  //always dispatch from timeout to avoid dispatch before return
  dispatch = (data, delayms = 0) => setTimeout(() => rdispatch(data),delayms)
  return {
    homeView: () => rdispatch({ f: 'setView', view: 'home' }),
    sequenceView: () => rdispatch({ f: 'setView', view: 'sequence' }),

    openMenu: () => rdispatch({ f: 'setMenu', open: true }),
    closeMenu: () => rdispatch({ f: 'setMenu', open: false }),

    ledBrightness: (ledId, brightness) => rdispatch({ f: 'setLed', ledId: ledId, brightness: brightness, enable: true }),
    toggleRunning: () => rdispatch({ f: 'toggleRunning' }),
  }
}

