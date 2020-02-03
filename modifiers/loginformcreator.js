function createLoginFormModifier (execlib, applib, templatelib, htmltemplatelib) {
  'use strict';

  var lib = execlib.lib,
    BasicModifier = applib.BasicModifier;

  function LoginModifier (options) {
    BasicModifier.call(this, options);
  }
  lib.inherit(LoginModifier, BasicModifier);
  LoginModifier.prototype.doProcess = function (name, options, links, logic, resources) {
    options.elements.push(lib.extend({
      name: 'loginform',
      type: 'LoginFormLogic',
      options: lib.extend({
        actual: true,
        self_selector: '.',
        default_markup: createMarkup()
      },this.config.form),
      modifiers: [{
        name: 'AngularFormLogic.submit',
        options: {
          'actualon': 'none',
          'validon': 'valid',
          options:{
            self_selector: '.',
            actual: true
          }
        }
      }]
    }, this.config));
  };
  LoginModifier.prototype.DEFAULT_CONFIG = function () {
    return {
    };
  };

  applib.registerModifier('LoginForm', LoginModifier);


  var o = templatelib.override,
    hl = htmltemplatelib;

  function createMarkup() {
    return o(hl.form,
      'CONTENTS', [
        o(hl.textinput,
          'NAME', '__remote__username',
          'ATTRS', 'required="required"'
        ),
        o(hl.passwordinput,
          'NAME', '__remote__password',
          'ATTRS', 'required="required"'
        ),
        o(hl.button,
          'CLASS', 'loginformSubmit',
          'CONTENTS', 'Submit'
        )
      ]
    );
  }

}

module.exports = createLoginFormModifier;
