const Socket          = require("isomorphic-ws");
const etc             = require("etc-js");
const Op              = require("./Op");
const StoreController = require("./Crypto/StoreController");
const MemStore        = require("./Crypto/MemStore");
const BuildURL        = require("./BuildURL");

function Phoxy(o) {
  var $this = this;
  $this.deviceName = o.deviceName;
  $this.token    = o.token || "";
  $this.username = o.username;
  $this.password = o.password;
  $this.apiurl = o.apiurl;
  $this.url    = BuildURL($this.apiurl);
  if (o.store) {
    $this.store = new StoreController(o.store);
  } else {
    $this.store = new StoreController(new MemStore());
  }
  $this.sessions = {};
  $this.handlers = {};
}

Phoxy.prototype.publishCleavePackage = function(o) {
  var pl = new etc.Buffer();
  pl.writeString(o.name);
  pl.writeString(o.version);
  pl.writeString(o.url);
  pl.writeString(o.description);

  var $this = this;

  var url   = $this.url.subPath("/v1/cleave/publishPkg")
  .setQ("t", $this.token);

  return new etc.Req({
    method:   "POST",
    url:      url.toString(),
    payload:  pl.finish()
  }).do().then(function(r) {
    var b = new etc.Buffer(r.data);
    return b.readByte();
  });
}

Phoxy.prototype.queryCleavePackages = function(o) {
  var $this = this;
  var url = $this.url.subPath(`/v1/cleave/pkg`);

  if (o.type) {
    url = url.setQ("type", o.type);
  }

  if (o.name) {
    url = url.setQ("name", o.name);
  }

  if (o.author) {
    url = url.setQ("author", o.author);
  }

  return new Promise(function(y,n) {
    new etc.Req({
      method:   "GET",
      respType: "buffer",
      url:      url.toString()
    }).do().then(function(resp) {
      var pkgs = [];
      var b = new etc.Buffer(resp.data);
      var len = b.readUnsignedVarint().toNumber();
      for (var i = 0; i < len; i++) {
        var pkg = {};
        pkg.author      = b.readString();
        pkg.name        = b.readString();
        pkg.version     = b.readString();
        pkg.url         = b.readString();
        pkg.type        = b.readString();
        pkg.description = b.readString();
        pkgs.push(pkg);
      }
      y(pkgs);
    });
  });
}

Phoxy.op = Op;

Phoxy.prototype.callFunc = function(k, o) {
  var $this = this;
  var cb = $this.handlers[k];
  if (cb) {
    cb(o);
  }
}

Phoxy.prototype.handleFunc = function(k, fn) {
  this.handlers[k] = fn;
} 

Phoxy.prototype._handleMessage = function(ev) {
  var bf = new etc.Buffer(new Uint8Array(ev.data));
  var op = bf.readUint16().toNumber();

  this.callFunc(op, bf);
}

Phoxy.prototype._handleOpen = function() {
  this.callFunc(Op.SOCKET_OPEN, {});  
}

Phoxy.prototype.connectSocket = function() {
  var sock = this.url.toWs();
  sock.setQ("t", this.zdb.token);
  if (this.socket) {
    this.socket.removeEventListener("message");
    this.socket.removeEventListener("close");
    this.socket.removeEventListener("open");
  } 

  this.socket = new Socket(sock.toString());
  this.socket.addEventListener("message", this._handleMessage.bind(this));
  this.socket.addEventListener("open",    this._handleOpen.bind(this))
  this.socket.addEventListener("close",   this._handleClose.bind(this))
}

Phoxy.prototype.uploadPrekeyBuffer = function(buf, doneCb) {
  var sigbuf = this.signing.sign(buf.finish());
  new etc.Req({
    method: "POST",
    url:     this.url.subPath("/v1/registerDevice")
             .setQ("t", $this.token).toString(),
    payload: sigbuf
  }).do().then(function() {
    doneCb();
  });
}

Phoxy.prototype.initialize = function () {
  var $this = this;
  return new Promise(function (y, n) {
    $this.zdb = new ZDBAuthentication({
      username: $this.username,
      password: $this.password,
      apiurl:   $this.apiurl
    });

    $this.zdb.authenticate().then(function (status) {
      if (status !== Op.AUTH_SUCCESS) {
        y(status);
        return;
      }

      $this.token = $this.zdb.token;

      $this.store.loadNumber("status").then(function(n) {
        if (n == 0) {
          // This is a new Store.
          var buf = new etc.Buffer();
          $this.signing = new Core.SigningIdentity();
          $this.store.storeSigningIdentity("signing", $this.signing).then(function() {
            var fur = function(b, x) {
              var kp = new Core.Identity();
              $this.store.storeIdentity("prekey-" + x.toString()).then(function() {
                x = x + 1;
                if (x == 100) {
                  $this.uploadPrekeyBuffer(buf, y);
                  return;
                } else {
                  fur(buf, x);
                }
              });
            }
          });
        } else {
          // We already have a store.
          $this.store.loadSigningIdentity("signing").then(function(sig) {
            $this.signing = sig;
            y();
          });
        }
      });
    });
  });
}

/**
 * Checks if it's time to regenerate prekeys
 * 
 * @return {boolean}
 */
Phoxy.prototype.oldEnough = function () {
  // dummy function
  return false;
}

module.exports = Phoxy;