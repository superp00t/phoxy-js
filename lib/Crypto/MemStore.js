const Encoding = require("etc-js").Encoding;
const Core = require("./Core");

/* In memory key store */
function MemStore() {
  this.keys = {};
}

MemStore.prototype.initialize = function() {
  return new Promise(function(y, n) {
    y();
  });
}

MemStore.prototype.storeBytes = function (mapKey, id) {
  this.keys[mapKey] = Encoding.encodeToBase64(id);

  return new Promise(function (y, n) {
    y();
  });
}

MemStore.prototype.loadBytes = function (mapKey) {
  return new Promise(function (y, n) {
    if (this.keys[mapKey] == undefined) {
      y(null);
      return;
    }

    var b64 = this.keys[mapKey];
    var bin = Encoding.decodeFromBase64(b64);

    y(bin);
  });
}

module.exports = MemStore;