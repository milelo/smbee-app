let util = {}
export default util

/**
 * Create a debug function given package name
 */
util.debug = pname => function (message, value, renderAs = 'default') {
  const render = {
    default: v => v,
    string: JSON.stringify,
    bin: v => '0b' + v.toString(2),
    hex: v => '0x' + v.toString(16)
  }[renderAs]
  console.log(pname + '.' + (message ? message + ": " : "") + render(value) + '\n\n')
  return value
}

/**
 * A dummy debug function
 */
util.debugx = function (m, r) {
  return r
}