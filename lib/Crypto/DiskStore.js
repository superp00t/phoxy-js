const fs = require("fs");

/**
 * 
 * This class is for nodeJS-only. Use MemStore or LocalStore for HTML5.
 * 
 * @class
 * @param {string} path 
 */
function DiskStore(spath) {
  var path = spath.split("/");
  this.path = [];
  for (var i = 0; i < path.length; i++) {
    if (path[i] !== "") {
      this.path.push(path[i]);
    }
  }
}

/**
 * @return {Promise<void>}
 */
DiskStore.prototype.initialize = function() {
  var _this = this;
  return new Promise(function(y, n) {
    var path = _this.path.join("/");
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path);
      y();
      return;
    } else {
      y();
    }
  });
}

/**
 * 
 * @param  {string}     mapKey 
 * @param  {Uint8Array} data 
 * @return {Promise<void>}
 */
DiskStore.prototype.storeBytes = function (mapKey, data) {
  var path = this.path.concat([mapKey]).join("/");
  console.log(path);
  return new Promise(function (y, n) {
    fs.writeFile(path, new Buffer(data), "binary", function(err) {
      y();
    });
  });
}

/**
 * 
 * @param  {string} mapKey
 * @return {Promise<Uint8Array>}
 */
DiskStore.prototype.loadBytes = function(mapKey) {
  var path = this.path.concat([mapKey]).join("/");

  return new Promise(function(y, n) {
    fs.readFile(path, function(err, data) {
      if (err) {
        y(new Uint8Array([]));
        return;
      }

      y(new Uint8Array(data));
    });
  });
}

module.exports = DiskStore;