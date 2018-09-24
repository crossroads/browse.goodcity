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

  fullName: Ember.computed('firstName', 'lastName', function(){
    return (this.get('firstName') + " " + this.get('lastName'));
  }),

  isInfoComplete: Ember.computed('firstName', 'lastName', 'email', 'mobile', function(){
    return this.get('firstName').length !== 0 && this.get('lastName').length !== 0 && this.get('email').length !== 0 && this.get('mobile').length !== 0 && this.get('title') && this.get('title').length !== 0;
  })
});
