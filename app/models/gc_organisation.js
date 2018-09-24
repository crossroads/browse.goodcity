import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import Ember from "ember";
import { hasMany } from 'ember-data/relationships';

export default Model.extend({
  nameEn: attr('string'),
  nameZhTw: attr('string'),
  descriptionEn: attr('string'),
  descriptionZhTw: attr('string'),
  website: attr('string'),
  registration: attr('string'),
  usersCount: Ember.computed.alias('organisationsUsers.length'),

  organisationsUsers: hasMany('organisations_user', { async: false })
});
