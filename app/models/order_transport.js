import Ember from 'ember';
import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo } from 'ember-data/relationships';

export default Model.extend({

  timeslot:      attr('string'),
  transportType: attr('string'),
  vehicleType:   attr('string'),
  scheduledAt:   attr('date'),

  contact:  belongsTo('contact', { async: false }),
  order:    belongsTo('order', { async: false }),
  gogovanTransport:    belongsTo('gogovan_transport', { async: false }),

  isGGV: Ember.computed.equal("transportType", "ggv"),

  needEnglish: attr("boolean"),
  needCart: attr("boolean"),
  needCarry: attr("boolean"),
  needOverSixFt: attr("boolean"),
  removeNet: attr("string"),

  scheduledDate: Ember.computed('scheduledAt', function() {
    return moment(this.get('scheduledAt')).format("ddd LL");
  }),

  type: Ember.computed('transportType', function(){
    var type = this.get('transportType');
    if(type === "ggv"){
      return type.toUpperCase();
    } else if(type === "self"){
      return type.charAt(0).toUpperCase() + type.slice(1);
    } else {
      return "";
    }
  })

});
