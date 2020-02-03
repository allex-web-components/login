(function createLogin (execlib) {
  'use strict';
  var lib = execlib.lib,
    execSuite = execlib.execSuite,
    applib = execSuite.libRegistry.get('allex_applib'),
    templatelib = execSuite.libRegistry.get('allex_templateslitelib'),
    htmltemplatelib = execSuite.libRegistry.get('allex_htmltemplateslib');

  require('./elements')(execlib, applib, templatelib, htmltemplatelib);
  require('./modifiers')(execlib, applib, templatelib, htmltemplatelib);
  require('./prepreprocessors')(execlib, applib, templatelib, htmltemplatelib);


})(ALLEX)
