/* ===========================================================================
   The brand block. This and the five colour tokens at the top of
   assets/css/site.css are the only two places brand-variable content lives.
   See BRAND.md for the swap procedure.

   Note: the HTML ships with these same strings written inline, so the pages
   read correctly with JavaScript disabled. This file only overwrites them.
   =========================================================================== */
var BRAND = {
  name:        "STONE & CANYON",
  nameFull:    "Stone & Canyon Development",
  tagline:     "Luxury home development and investment",
  location:    "Orange County, California",
  email:       "[EMAIL]",
  phone:       "[PHONE]",
  established: "[YEAR FOUNDED]"
};

(function () {
  "use strict";
  var nodes = document.querySelectorAll("[data-brand]");
  for (var i = 0; i < nodes.length; i++) {
    var key = nodes[i].getAttribute("data-brand");
    if (Object.prototype.hasOwnProperty.call(BRAND, key)) nodes[i].textContent = BRAND[key];
  }
  var title = document.querySelector("[data-brand-title]");
  if (title) title.textContent = title.getAttribute("data-brand-title").replace("{name}", BRAND.nameFull);
}());
