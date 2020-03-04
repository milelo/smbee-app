let util = {}
export default util

// eslint-disable-next-line
util.dbg = function (m, r, decode = 'default') {
  const decoder = {
    default: x => x, 
    string: JSON.stringify, 
    bin: x => '0b'+ x.toString(2)
  }[decode]
  console.log((m ? m + ": " : "") + decoder(r)+'\n\n')
  return r
}

// eslint-disable-next-line
util.dbgx = function (m, r) {
  return r
}