const Core       = require("./Core");
const etc        = require("etc-js");
/**
 * StoreController implements a wrapper around a low-level storage interface
 * in order to provide reliable access to a variety of storage methods
 * for the PHOXY protocol to store metadata and keys with.
 * 
 * @param {Object} storeInterface 
 */
function StoreController(storeInterface) {
  this.store = storeInterface;
}

StoreController.prototype.initialize = function() {
  return this.store.initialize();
}

/**
 * 
 * @param  {String} key
 * 
 * @return {Promise<Core.Identity>} 
 */
StoreController.prototype.loadIdentity = function (key) {
  return
  this.store.loadBytes(key)
    .then(function (data) {
      if (data == null) {
        return null;
      }
      return new Core.Identity(data);
    });
}

/**
 * 
 * @param  {String} key
 * @param  {Core.Identity} id
 * 
 * @return {Promise<void>} 
 */
StoreController.prototype.storeIdentity = function (key, id) {
  return this.store.storeBytes(key, id.kp.secretKey);
}

/**
 * 
 * @param  {String} key
 * 
 * @return {Promise<Core.SigIdentity>} 
 */
StoreController.prototype.loadSigIdentity = function (key) {
  return
  this.store.loadBytes(key)
    .then(function (data) {
      if (data == null) {
        return null;
      }
      return new Core.SigIdentity(data);
    });
}

/**
 * 
 * @param  {String} key
 * @param  {Core.SigIdentity} id
 * 
 * @return {Promise<void>} 
 */
StoreController.prototype.storeSigIdentity = function (key, id) {
  return this.store.storeBytes(key, id.kp.secretKey);
}

/**
 * 
 * @param  {String} key
 * @param  {Uint8Array} 
 * 
 * @return {Promise<void>} 
 */
StoreController.prototype.storeBytes = function (key, d) {
  return this.store.storeBytes(key, id.kp.secretKey);
}

/**
 * 
 * @param  {String} key
 * @return {Promise<Uint8Array>} 
 */
StoreController.prototype.loadBytes = function (key) {
  return this.store.loadBytes(key);
}

/**
 * 
 * @param {String} key 
 * @param {Number} v 
 * 
 * @return {Promise<void>} 
 */
StoreController.prototype.storeNumber = function (key, v) {
  var bb = new etc.Buffer();
  bb.writeSignedVarint(v);
  return this.store.storeBytes(key, bb.finish());
}

/**
 * 
 * @param {String} key 
 * 
 * @return {Promise<Number>} 
 */
StoreController.prototype.loadNumber = function (key) {
  return this.store.loadBytes(key)
    .then(function (d) {
      if (d == null) {
        return 0;
      }
      
      var bb = new etc.Buffer(d);
      return bb.readSignedVarint();
    });
}

module.exports = StoreController;