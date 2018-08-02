import attr from 'ember-data/attr';
import Ember from 'ember';
import Addressable from './addressable';
import { hasMany } from 'ember-data/relationships';

export default Addressable.extend({
  firstName:   attr('string'),
  lastName:    attr('string'),
  mobile:      attr('string'),
  createdAt:   attr('date'),
  organisations: hasMany('organisation', {async: false}),
  organisationsUsers: hasMany('organisationsUsers', {async: false}),

  userRoles: hasMany('userRoles', { async: false }),
  roles: hasMany('roles', { async: false }),

  mobileWithoutCountryCode: Ember.computed('mobile', function(){
    var mobile = this.get('mobile');
    return mobile ? ((mobile.indexOf("+852") >= 0) ? mobile.substring('4') : mobile) : '';
  }),

  fullName: Ember.computed('firstName', 'lastName', function(){
    return (this.get('firstName') + " " + this.get('lastName'));
  })
});
