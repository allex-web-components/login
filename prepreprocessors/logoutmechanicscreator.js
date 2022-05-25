function createLogoutMechanicsPrePreprocessor (execlib, applib, templatelib, htmltemplatelib) {
  'use strict';

  //App prepreprocessor only
  var lib = execlib.lib,
    BasicProcessor = applib.BasicProcessor;

  function LogoutMechanicsPrePreprocessor (options) {
    BasicProcessor.call(this, options);
  }
  lib.inherit(LogoutMechanicsPrePreprocessor, BasicProcessor);
  LogoutMechanicsPrePreprocessor.prototype.process = function (desc) {
    var envname = this.config.environmentname;
    desc.preprocessors = desc.preprocessors || {};
    desc.preprocessors.DataSource = desc.preprocessors.DataSource || [];
    desc.links = desc.links || [];
    desc.links.push({
      source: 'element.'+this.config.pathtologoutbutton+'!clicked',
      target: 'environment.'+envname+'>logout'
    });
  };

  LogoutMechanicsPrePreprocessor.prototype.neededConfigurationNames = ['environmentname', 'pathtologoutbutton'];

  applib.registerPrePreprocessor('LogoutMechanics', LogoutMechanicsPrePreprocessor);

}

module.exports = createLogoutMechanicsPrePreprocessor;

