function createElements (execlib, applib, templatelib, htmltemplatelib) {
  'use strict';

  var lib = execlib.lib,
    FormElement = applib.getElementType('FormElement');

  function LoginFormLogic (id, options) {
    FormElement.call(this, id, options);
  }
  lib.inherit(LoginFormLogic, FormElement);
  LoginFormLogic.prototype.__cleanUp = function () {
    FormElement.prototype.__cleanUp.call(this);
  };
  LoginFormLogic.prototype.fireInitializationDone = function () {
    this.checkForInputNamed('__remote__username');
    this.checkForInputNamed('__remote__password');
    FormElement.prototype.fireInitializationDone.call(this);
  };
  LoginFormLogic.prototype.checkForInputNamed = function (name) {
    if (this.$element.find("input[name='"+name+"']").length != 1) {
      throw new Error ('Login form has to have an input with name "'+name+'"');
    }
  };
  applib.registerElementType('LoginFormLogic', LoginFormLogic);
}

module.exports = createElements;
