const etc = require("etc-js");

function P2P(server, stuns) {
  var st = stuns || ["stun.services.mozilla.com:3478"];

  this.directoryServer = server
  this.stunServer      = etc.ChooseRandom(st);
}

module.exports = P2P;