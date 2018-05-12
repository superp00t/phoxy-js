const Remarkable       = require("remarkable");
const san               = require("sanitize-html/src/");

function Markup(input) {
  // Add markdown
  var html = new Remarkable("full", { html: true }).render(input); 
  // sanitize html
  return san(html, {
    allowedTags:   [ 'p', 'b', 'i', 'em', 'strong', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    allowedClasses: { 
      'p': ["tng1"]
    },
    allowedAttributes: {
      'a': [ 'href' ]
    }
  });
}

module.exports = Markup;