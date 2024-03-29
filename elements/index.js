function createElements (execlib, applib, templatelib, htmltemplatelib) {
  'use strict';

  var lib = execlib.lib,
    FormElement = applib.getElementType('FormElement'),
    usernamestring = '__remote__username',
    passwordstring = '__remote__password',
    loginbuttonfinder = 'loginbutton';

  function LoginFormLogic (id, options) {
    FormElement.call(this, id, options);
  }
  lib.inherit(LoginFormLogic, FormElement);
  LoginFormLogic.prototype.__cleanUp = function () {
    FormElement.prototype.__cleanUp.call(this);
  };
  LoginFormLogic.prototype.show = function () {
    if (this.tryAutoLogin()) {
      return;
    }
    if (this.tryUrlExtraction()) {
      return;
    }
    FormElement.prototype.show.call(this);
  };
  LoginFormLogic.prototype.staticEnvironmentDescriptor = function (myname) {
    var submitclickablename = this.getConfigVal('submitclickablename');
    if (submitclickablename) {
      return {
        logic: [{
          triggers: 'element.'+myname+'.'+submitclickablename+'!clicked',
          handler: this.fireSubmit.bind(this)
        }]
      }
    }
  }
  LoginFormLogic.prototype.fireInitializationDone = function () {
    this.inputNamed(usernamestring);
    this.inputNamed(passwordstring);
    FormElement.prototype.fireInitializationDone.call(this);
  };
  LoginFormLogic.prototype.inputNamed = function (name) {
    var ret = this.$element.find("input[name='"+name+"']");
    if (ret.length != 1) {
      throw new Error ('Login form has to have an input with name "'+name+'"');
    }
    return ret;
  };
  LoginFormLogic.prototype.tryAutoLogin = function () {
    var autologin = this.getConfigVal('autologin');
    if (!autologin) {
      return;
    }
    if (!(usernamestring in autologin)) {
      console.warn('No', usernamestring, 'in autologin');
      return;
    }
    if (!(passwordstring in autologin)) {
      console.warn('No', passwordstring, 'in autologin');
      return;
    }
    this.inputNamed(usernamestring).val(autologin[usernamestring]);
    this.inputNamed(passwordstring).val(autologin[passwordstring]);
    this.wantsSubmit.fire(autologin);
  };
  LoginFormLogic.prototype.tryUrlExtraction = function () {
    var urlex = this.urlExtraction();
    if (urlex) {
      this.inputNamed(usernamestring).val(urlex[usernamestring]);
      this.inputNamed(passwordstring).val(urlex[passwordstring]);
      this.wantsSubmit.fire(lib.extend(urlex, this.hardcodedFields));
      return true;
    }
  };
  LoginFormLogic.prototype.urlExtraction = function () {
    var urlex = this.getConfigVal('urlextraction'), query, ret, username;
    if (!urlex) {
      return null;
    }
    if (!(usernamestring in urlex)) {
      console.warn('No', usernamestring, 'in urlextraction');
      return null;
    }
    if (!(passwordstring in urlex)) {
      console.warn('No', passwordstring, 'in urlextraction');
      return null;
    }
    query = (new URL(window.location)).searchParams;
    username = query.get(urlex[usernamestring]);
    if (!username) {
      return null;
    }
    ret = {};
    ret[usernamestring] = username;
    ret[passwordstring] = query.get(urlex[passwordstring]);
    return ret;
  };
  applib.registerElementType('LoginFormLogic', LoginFormLogic);
}

module.exports = createElements;
