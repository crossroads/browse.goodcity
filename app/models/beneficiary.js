import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo } from 'ember-data/relationships';

export default Model.extend({
  firstName:        attr('string'),
  lastName:         attr('string'),
  identityNumber:   attr('string'),
  title:            attr('string'),
  phoneNumber:      attr('string'),

  identityType: belongsTo('identityType', { async: false }),

});
