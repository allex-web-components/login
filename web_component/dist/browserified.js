(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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

},{}],2:[function(require,module,exports){
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

},{"./elements":1,"./modifiers":3,"./prepreprocessors":5}],3:[function(require,module,exports){
function createModifiers (execlib, applib, templatelib, htmltemplatelib) {
  'use strict';

  require('./loginformcreator')(execlib, applib, templatelib, htmltemplatelib);

}

module.exports = createModifiers;

},{"./loginformcreator":4}],4:[function(require,module,exports){
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
        name: 'FormLogic.submit',
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

},{}],5:[function(require,module,exports){
function createPrePreprocessors (execlib, applib, templatelib, htmltemplatelib) {
  'use strict';

  require('./loginmechanicscreator')(execlib, applib, templatelib, htmltemplatelib);
}

module.exports = createPrePreprocessors;


},{"./loginmechanicscreator":6}],6:[function(require,module,exports){
function createLoginMechanicsPrePreprocessor (execlib, applib, templatelib, htmltemplatelib) {
  'use strict';

  //App prepreprocessor only
  var lib = execlib.lib,
    BasicProcessor = applib.BasicProcessor;

  function LoginMechanicsPrePreprocessor (options) {
    BasicProcessor.call(this, options);
  }
  lib.inherit(LoginMechanicsPrePreprocessor, BasicProcessor);
  LoginMechanicsPrePreprocessor.prototype.process = function (desc) {
    var envname = this.config.environmentname,
      rolemap = this.config.rolemap,
      statemap = this.config.statemap,
      roles = [],
      roletargets = [],
      states = [],
      statetargets = [];
    /*
    if (!('object' === typeof rolemap && rolemap && rolemap['.'])) {
      throw new Error ('rolemap has to be an object with at least one property, "."');
    }
    */
    lib.traverseShallow(rolemap, objtokeysnvalues.bind(null, roles, roletargets));
    if (statemap) {
      lib.traverseShallow(statemap, objtokeysnvalues.bind(null, states, statetargets));
    }
    desc.preprocessors = desc.preprocessors || {};
    desc.preprocessors.DataSource = desc.preprocessors.DataSource || [];
    desc.preprocessors.DataSource.push({
      environment: envname,
      entity: {
        name: 'role',
        type: 'allexstate',
        options: {
          sink: '.',
          path: 'profile_role'
        }
      }
    });
    desc.links = desc.links || [];
    desc.links.push({
      source: 'element.'+this.config.pathtologinform+'!wantsSubmit',
      target: 'environment.'+envname+'>login'
    });
    desc.logic = desc.logic || [];
    desc.logic.push({
      triggers: 'environment.'+envname+'>login',
      references: 'element.'+this.config.pathtologinform,
      handler: function (form, func) {
        form.resetData();
      }
    },{
      triggers: 'datasource.role:data',
      references: roletargets.join(','),
      handler: function () {
        var myroletargets = Array.prototype.slice.call(arguments, 0, arguments.length-1),
          role = arguments[arguments.length-1],
          roleindex = roles.indexOf(role),
          target;
        myroletargets.forEach(deactualizer);
        if (roleindex<0) {
          roleindex = roles.indexOf('.');
        }
        if (roleindex<0) {
          console.log('Nothing to actualize for role', role);
          return;
        }
        target = arguments[roleindex];
        console.log('will actualize', target.id);
        target.set('actual', true);
      }
    },{
      triggers: 'environment.'+envname+':state',
      references: 'datasource.role',
      handler: function (roleds, state) {
        if (state!=='established') {
          roleds.set('data', null);
        }
      }
    });
    if (statetargets.length>0) {
      desc.logic.push({
        triggers: 'environment.'+envname+':state',
        references: statetargets.join(','),
        handler: function () {
          var mystatetargets = Array.prototype.slice.call(arguments, 0, arguments.length-1),
            state = arguments[arguments.length-1],
            stateindex = states.indexOf(state),
            target;
          console.log('will deactualize', mystatetargets);
          mystatetargets.forEach(deactualizer);
          if (stateindex<0) {
            stateindex = states.indexOf('.');
          }
          if (stateindex<0) {
            console.log('Nothing to actualize for environment state', state);
            return;
          }
          target = arguments[stateindex];
          console.log('will actualize', target.id);
          target.set('actual', true);
        }
      });
    }
  };

  function objtokeysnvalues (keys, values, val, key) {
    keys.push(key);
    values.push('element.'+val);
  }

  function deactualizer (thingy) {
    thingy.set('actual', false);
  }

  LoginMechanicsPrePreprocessor.prototype.neededConfigurationNames = ['environmentname', 'pathtologinform', 'rolemap'];

  applib.registerPrePreprocessor('LoginMechanics', LoginMechanicsPrePreprocessor);

}

module.exports = createLoginMechanicsPrePreprocessor;


},{}]},{},[2]);
