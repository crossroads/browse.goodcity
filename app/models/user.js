import attr from 'ember-data/attr';
import Ember from 'ember';
import Addressable from './addressable';
import { hasMany } from 'ember-data/relationships';

export default Addressable.extend({
  firstName:   attr('string'),
  lastName:    attr('string'),
  mobile:      attr('string'),
  createdAt:   attr('date'),
  email:       attr('string'),
  title:       attr('string'),

  organisations: hasMany('organisation', {async: false}),
  organisationsUsers: hasMany('organisationsUsers', {async: false}),

  userRoles: hasMany('userRoles', { async: false }),
  roles: hasMany('roles', { async: false }),

  mobileWithoutCountryCode: Ember.computed('mobile', function(){
    var mobile = this.get('mobile');
    return mobile ? ((mobile.indexOf("+852") >= 0) ? mobile.substring('4') : mobile) : '';
  }),

Similar blocks of code found in 2 locations. Consider refactoring.   …
  fullName: Ember.computed('firstName', 'lastName', function(){
    return (this.get('firstName') + " " + this.get('lastName'));
  }),

  isInfoComplete: Ember.computed('firstName', 'lastName', 'email', 'mobile', 'title', function(){
    return this.hasValue('firstName', 'lastName', 'email', 'mobile', 'title');
  }),

  hasValue(...args) {
    let hasValue = true;
    for (let i = 0; i < args.length; i ++) {
      if(!this.get(args[i]) || !this.get(args[i]).length) {
        hasValue = false;
        break;
      }
    }
    return hasValue;
  },

  //*****************
  // Utility methods
  //*****************

  roleNames() {
    return this.get('userRoles').getEach('role.name');
  },

  hasRole(role) {
    return this.roleNames().indexOf(role) >= 0;
  }
});

