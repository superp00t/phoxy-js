const etc = require("etc-js");

module.exports = function(apiurl) {
  var orig = apiurl;
  // Trim trailing slash
  var a = apiurl.split("");
  var t = a.pop();
  if (t == "/") {
    apiurl = a.join("");
  } else {
    apiurl = orig;
  }

  return new etc.URL(apiurl);
}