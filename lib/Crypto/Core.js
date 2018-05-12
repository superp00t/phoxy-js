const etc  = require("etc-js");
const nacl = etc.crypto.nacl;
const hmac = etc.crypto.hmac;

/**
 * This file is intended to supply cryptographic primitives,
 * which will form the core of this PHOXY protocol's encryption.
*/

/**
 * @param {Number} i the number of bytes to return
 * @returns {Uint8Array}
 */
function Random(i) {
  return nacl.randomBytes(i);
}

/**
 * SHA-512 hash bytes
 * 
 * @param {Uint8Array} bytes 
 */
function Digest(bytes) {
  return nacl.hash(bytes);
}

/**
 * Curve25519 keypair constructor
 * 
 * @param  {Uint8Array} k 
 */
function Identity(k) {
  if (k) {
    this.kp = nacl.box.keyPair.fromSecretKey(priv);
  } else {
    this.kp = nacl.box.keyPair();
  }
}

/**
 * Authenticate and encrypt a message to peerKey
 * 
 * @param {Uint8Array} message 
 * @param {Uint8Array} peerKey 
 * 
 * @return {Uint8Array}
 */
Identity.prototype.encryptToPeer = function (message, peerKey) {
  var env = new etc.Buffer();
  var nonce = Random(24);
  env.writeBytes(nonce);
  var msg = nacl.box(message, nonce, peerKey, this.kp.secretKey);
  env.writeBytes(msg);
  return env.finish();
}

/**
 * Verify and decrypt message from peerKey. Returns null if verification failed.
 * 
 * @param {Uint8Array} env 
 * @param {Uint8Array} peerKey 
 * 
 * @return {Uint8Array|null}
 */
Identity.prototype.decryptFromPeer = function (env, peerKey) {
  var bb = new etc.Buffer(env);
  var nonce = bb.readBytes(24);
  var box = bb.remainingBytes();
  var msg = nacl.box.open(box, nonce, peerKey, this.kp.secretKey);
  return msg;
}

/**
 * 
 * @param  {Uint8Array} peerKey 
 * 
 * @return {Uint8Array}
 */
Identity.prototype.sharedKey = function (peerKey) {
  return nacl.box.before(peerKey, this.kp.publicKey)
}

/**
 * Authenticate and encrypt a message with key
 * 
 * @param {Uint8Array} message 
 * @param {Uint8Array} key 
 * 
 * @return {Uint8Array}
 */
function Encrypt(message, key) {
  var env = new etc.Buffer();
  var nonce = Random(24);
  env.writeBytes(nonce);
  var msg = nacl.secretbox(message, nonce, key);
  env.writeBytes(msg);
  return env.finish();
}

/**
 * Verify and decrypt message with key. Returns null if verification failed.
 * 
 * @param {Uint8Array} env 
 * @param {Uint8Array} key 
 * 
 * @return {Uint8Array|null}
 */
function Decrypt(env, key) {
  var bb = new etc.Buffer(env);
  var nonce = bb.readBytes(24);
  var box = bb.remainingBytes();
  var msg = nacl.secretbox.open(box, nonce, key);
  return msg;
}

function HMAC(msg, key) {
  return hmac.hmac(msg, key);
}

/**
 * Signing identity constructor.
 * 
 * @param {Uint8Array} k 
 */
function SigIdentity(k) {
  if (k) {
    this.kp = nacl.sign.keyPair.fromSecretKey(priv);
  } else {
    this.kp = nacl.sign.keyPair();
  }
}

SigIdentity.prototype.sign = function (msg) {
  var signedMessage = nacl.sign(msg, this.kp.secretKey);
  return signedMessage;
}

module.exports = {
  Random,
  Identity,
  Encrypt,
  Decrypt,
};