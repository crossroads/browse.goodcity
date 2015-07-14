// import Ember from "ember";
import DS from 'ember-data';

var attr = DS.attr,
  belongsTo = DS.belongsTo;

export default DS.Model.extend({
  favourite:     attr('boolean'),
  cloudinaryId:  attr('string'),
  item:          belongsTo('item'),
});
