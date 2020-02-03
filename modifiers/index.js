function createModifiers (execlib, applib, templatelib, htmltemplatelib) {
  'use strict';

  require('./loginformcreator')(execlib, applib, templatelib, htmltemplatelib);

}

module.exports = createModifiers;
