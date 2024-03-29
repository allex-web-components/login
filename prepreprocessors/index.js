function createPrePreprocessors (execlib, applib, templatelib, htmltemplatelib) {
  'use strict';

  require('./loginmechanicscreator')(execlib, applib, templatelib, htmltemplatelib);
  require('./logoutmechanicscreator')(execlib, applib, templatelib, htmltemplatelib);
}

module.exports = createPrePreprocessors;

