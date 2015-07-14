// import Ember from 'ember';
import DS from 'ember-data';

var attr = DS.attr,
    belongsTo = DS.belongsTo,
    hasMany   = DS.hasMany;

export default DS.Model.extend({
  donorDescription: attr('string'),
  createdAt:        attr('date'),
  updatedAt:        attr('date'),
  images:           hasMany('image'),
  packageType:      belongsTo('package_type'),
  saleable:         attr('boolean')
});
