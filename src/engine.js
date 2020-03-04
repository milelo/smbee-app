//import update from 'immutability-helper'; //https://github.com/kolodny/immutability-helper
import util from './util'
/*
//LED state (ledState) values
#define LEDS_OFF 0
#define ANTENNA_R 2
#define ANTENNA_L 1
#define ANTENNA_RL 3 //Individually controllable
#define EYES 5       //Not individually controllable
#define STING 6
#define EYES_STING 4 //Individually controllable

//Flash rate values for dynamic brightness (brightness parameters)
#define FLASH_FAST 0b10000001
#define FLASH_MED 0b10000010
#define FLASH_SLOW 0b10000011
#define FLASH_VSLOW 0b10000100
#define FLASH_VVSLOW 0b10000111
#define FLASH_ANTIPHASE 0b01000000 // OR with flash-rate

//wait for time specified in deci-seconds unit: ~s/10 eg 15ds = 1.5s
void wait(uint8_t time);

//Show the specified ledState with 100% static brightness
void show(uint8_t ledState);

//Show (with 1 extra parameter) the specified ledState with specified 
//static-brightness 0-100% or a flashRate value.
//OR in optional FLASH_ANTIPHASE flags eg "FLASH_VSLOW | FLASH_ANTIPHASE"
void show1(uint8_t ledState, uint8_t brightness);

//Show (with 2 extra parameters). Provides individual LED control for duel-LED states.
//Show the specified ledState with specified individual static-brightness 0-100% or flashRate value.
//OR in optional FLASH_ANTIPHASE flags eg "FLASH_VSLOW | FLASH_ANTIPHASE"
void show2(uint8_t ledState, uint8_t brightness1, uint8_t brightness2);

 */
//Led patterns
export const LEDS_OFF = 0
export const ANTENNA_R = 2
export const ANTENNA_L = 1
export const ANTENNA_RL = 3
export const EYES = 5       //Not individually controllable
export const STING = 6
export const EYES_STING = 4 //Individually controllable

//Flash rate values for dynamic brightness (brightness parameters)
export const FLASH_RATE = 0b10000000
export const FLASH_FAST = 0b10000001
export const FLASH_MED = 0b10000010
export const FLASH_SLOW = 0b10000011
export const FLASH_VSLOW = 0b10000100
export const FLASH_VVSLOW = 0b10000111
export const FLASH_ANTIPHASE = 0b1000000 | FLASH_RATE //only applies to flash rate


// eslint-disable-next-line
const dbg = util.debug('engine')
// eslint-disable-next-line
const dbgx = util.debugx

export function show(ledPattern) {
  return show2(ledPattern, 100, 100)
}

export function show1(ledPattern, brightness) {
  return show2(ledPattern, brightness, brightness)
}

function decodeBrightness(brightness) {
  if (brightness & FLASH_RATE) {
    return [0, [null, 'fast', 'medium', 'slow', 'vSlow', 'vvSlow', 'vvSlow'][brightness & 0b111]]
  } else {
    return [brightness, null]
  }
}

export function show2(ledPattern, brightness1, brightness2) {
  const antiPhase = ((brightness1 & FLASH_ANTIPHASE) === FLASH_ANTIPHASE) ? true : false
  const d1 = decodeBrightness(brightness1)
  const d2 = decodeBrightness(brightness2)
  //dbg('decodeBrightness(brightness1)', d1, 'string')
  const ledOff = [0, null]
  const [[bar, far], [bal, fal], [be, fe], [bs, fs]] = [
    [ledOff, ledOff, ledOff, ledOff],
    [ledOff, d1, ledOff, ledOff],
    [d1, ledOff, ledOff, ledOff],
    [d1, d2, ledOff, ledOff],
    [ledOff, ledOff, d1, d2],
    [ledOff, ledOff, d1, ledOff],
    [ledOff, ledOff, ledOff, d1],
  ][ledPattern]
  return {
    f: 'showLeds',
    ledBrightnessUpdate: {
      rightAntennae: { brightness: { $set: bar }, flashRate: { $set: far }, antiPhase: { $set: antiPhase } },
      leftAntennae: { brightness: { $set: bal }, flashRate: { $set: fal }, antiPhase: { $set: antiPhase } },
      rightEye: { brightness: { $set: be }, flashRate: { $set: fe }, antiPhase: { $set: antiPhase } },
      leftEye: { brightness: { $set: be }, flashRate: { $set: fe }, antiPhase: { $set: antiPhase } },
      sting: { brightness: { $set: bs }, flashRate: { $set: fs }, antiPhase: { $set: antiPhase } },
    }
  }
}

export function wait(deciSec) {
  return {
    f: 'wait',
    timems: deciSec * 100,
  }
}