(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
    options = options || {};
    options.elements = options.elements || [];
    options.elements.push(lib.extend({
      name: 'loginform',
      type: 'LoginFormLogic',
      options: lib.extend({
        actual: true,
        self_selector: '.',
        default_markup: createMarkup()
      },this.config.form)/*,
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
      }]*/
    }, lib.pickExcept(this.config, ['form'])));
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
  require('./logoutmechanicscreator')(execlib, applib, templatelib, htmltemplatelib);
}

module.exports = createPrePreprocessors;


},{"./loginmechanicscreator":6,"./logoutmechanicscreator":7}],6:[function(require,module,exports){
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
        myroletargets.forEach(deactualizer.bind(null, null));
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
          console.log('current state', state);
          if (stateindex<0) {
            stateindex = states.indexOf('.');
          }
          if (stateindex<0) {
            console.log('Nothing to actualize for environment state', state);
            return;
          }
          target = arguments[stateindex];
          console.log('will deactualize', mystatetargets, 'except', target.id);
          mystatetargets.forEach(deactualizer.bind(null, target));
          console.log('will actualize', target.id);
          target.set('actual', true);
          target = null;
        }
      });
      if (!this.config.ignoreconnectionattempts && statemap.pending) {
        desc.links.push({
          source: 'environment.'+envname+':connectionAttempt',
          target: 'element.'+statemap.pending+':connectionAttempt'
        })
      }
    }
  };

  function objtokeysnvalues (keys, values, val, key) {
    keys.push(key);
    values.push('element.'+val);
  }

  function deactualizer (except, thingy) {
    if (thingy == except) {
      return;
    }
    thingy.set('actual', false);
  }

  LoginMechanicsPrePreprocessor.prototype.neededConfigurationNames = ['environmentname', 'pathtologinform', 'rolemap'];

  applib.registerPrePreprocessor('LoginMechanics', LoginMechanicsPrePreprocessor);

}

module.exports = createLoginMechanicsPrePreprocessor;


},{}],7:[function(require,module,exports){
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


},{}]},{},[2]);
