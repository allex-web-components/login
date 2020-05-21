function createElements (execlib, applib, templatelib, htmltemplatelib) {
  'use strict';

  var lib = execlib.lib,
    FormLogic = applib.getElementType('FormLogic');

  function LoginFormLogic (id, options) {
    FormLogic.call(this, id, options);
  }
  lib.inherit(LoginFormLogic, FormLogic);
  LoginFormLogic.prototype.fireInitializationDone = function () {
    this.checkForInputNamed('__remote__username');
    this.checkForInputNamed('__remote__password');
    FormLogic.prototype.fireInitializationDone.call(this);
  };
  LoginFormLogic.prototype.checkForInputNamed = function (name) {
    if (this.$element.find("input[name='"+name+"']").length != 1) {
      throw new Error ('Login form has to have an input with name "'+name+'"');
    }
  };
  applib.registerElementType('LoginFormLogic', LoginFormLogic);
  applib.getModifier('FormLogic.submit').ALLOWED_ON.push('LoginFormLogic');
}

module.exports = createElements;
