const Op = require("./Op");
const etc = require("etc-js");
const Core = require("./Crypto/Core");

/**
 * @typedef {Object} ZDBOptions
 * @param   {String} apiurl
 * @param   {String} username
 * @param   {String} password
 */

/**
 * @class
 * @param {ZDBOptions} o 
 */
function ZDBAuthentication(o) {
  var {
    apiurl,
    username,
    password
  } = o;

  var orig = apiurl;
  // Trim trailing slash
  var a = apiurl.split("");
  var t = a.pop();
  if (t == "/") {
    apiurl = a.join("");
  } else {
    apiurl = orig;
  }

  this.api = new etc.URL(apiurl);
  this.username = username;
  this.password = password;
}

/**
 * @return {Promise<Number>}
 */
ZDBAuthentication.prototype.authenticate = function () {
  var $this = this;

  // Only known to the client.
  var privateHash = new etc.Buffer();
  privateHash.writeString(this.username.toLowerCase());
  privateHash.writeString(this.password);
  $this.private = privateHash.digest();

  // Only known to the server.
  privateHash.writeString("public");
  $this.public = privateHash.digest();

  // For additional security, use a salt in transit
  var salt = Core.Random(32)

  /* 
    Salt := RandomBytes(32)

    Challenge := SHA512(
      SHA512(Username, NULL, Password, NULL, "public", NULL),
      Salt)

      */

  var transitHash = new etc.Buffer();
  transitHash.writeBytes($this.public);
  transitHash.writeBytes(salt);
  var tH = transitHash.digest();

  var transitBuffer = new etc.Buffer();
  transitBuffer.writeString($this.username.toLowerCase());
  transitBuffer.writeBytes(tH);
  transitBuffer.writeBytes(salt);

  return new Promise(function (y, n) {
    new etc.Req({
      url: $this.api.subPath("/v1/zdb/login").toString(),
      method: "POST",
      payload: transitBuffer.finish(),
      respType: "buffer"
    }).do().then(function (resp) {
      if (resp.status == 429) {
        y(Op.RATE_LIMITED);
        return;
      }

      var d = new etc.Buffer(resp.data);
      $this.status = d.readByte();

      switch ($this.status) {
        case Op.AUTH_SUCCESS:
          $this.token = d.readString();
          break;
        default:
          break;
      }

      y($this.status);
    });
  });
}

ZDBAuthentication.prototype.avatar = function (user) {
  return this.api.subPath(`/v1/zdb/avatar/${encodeURIComponent(user)}`).toString();
}

ZDBAuthentication.prototype.userExists = function (user) {
  return new etc.Req({
    method:   "GET",
    respType: "buffer",
    url:      this.api.subPath(`/v1/zdb/userExists/${encodeURIComponent(user)}`).toString()
  }).do().then(function(r) {
    return new etc.Buffer(r.data).readByte() == 1;
  });
}

/**
 * @return {Promise<void>}
 */
ZDBAuthentication.prototype.getCaptcha = function () {
  var $this = this;
  return new Promise(function(y, n) {
    new etc.Req({
      url:    $this.api.subPath("/v1/zdb/newCaptcha").toString(),
      method: "GET",
      respType: "buffer"
    }).do().then(function(resp) {
      var e = new etc.Buffer(resp.data);
      var id = e.readString();
      $this.captchaID = id;
      y();
      return;
    }); 
  });
}

/**
 * @return {String}
 */
ZDBAuthentication.prototype.captchaURL = function() {
  return this.api.subPath("/v1/zdb/captcha/" + this.captchaID + ".png");
}

/**
 * @return {Promise<Number>}
 */
ZDBAuthentication.prototype.register = function (captchaSolution) {
  var $this = this;
  
  return new Promise(function (y, n) {
    var tH = new etc.Buffer();
    tH.writeString($this.username.toLowerCase());
    tH.writeString($this.password);

    // Only known to the server.
    tH.writeString("public");

    var bb = new etc.Buffer();
    bb.writeString($this.captchaID);
    bb.writeString(captchaSolution);
    bb.writeString($this.username.toLowerCase());
    bb.writeBytes(tH.digest());

    var resp;

    new etc.Req({
      url:     $this.api.subPath("/v1/zdb/register").toString(),
      method: "POST",
      payload: bb.finish()
    }).do().then(function (rsp) {
      if (rsp.status == 429) {
        y(Op.RATE_LIMITED);
        return;
      }

      y(new etc.Buffer(rsp.data).readByte())
    });
  });
}

module.exports = ZDBAuthentication;