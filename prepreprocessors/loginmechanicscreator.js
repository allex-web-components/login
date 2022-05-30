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
          console.log('current state', state);
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

  function deactualizer (thingy) {
    thingy.set('actual', false);
  }

  LoginMechanicsPrePreprocessor.prototype.neededConfigurationNames = ['environmentname', 'pathtologinform', 'rolemap'];

  applib.registerPrePreprocessor('LoginMechanics', LoginMechanicsPrePreprocessor);

}

module.exports = createLoginMechanicsPrePreprocessor;

