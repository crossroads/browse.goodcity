import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo } from 'ember-data/relationships';

export default Model.extend({
  quantity: attr('string'),
  description: attr('string'),
  itemSpecifics: attr('string'),
  packageType: belongsTo('package_type', { async: false }),
  order: belongsTo('order', { async: false }),
  code: attr('number')
});
