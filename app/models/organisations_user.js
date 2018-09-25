import Ember from 'ember';
import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo } from 'ember-data/relationships';

export default Model.extend({

  userId:          attr('number'),
  organisationId:  attr('number'),
  position:        attr('string'),
  user:            belongsTo('user', { async: false }),
  organisation:    belongsTo('organisation', { async: false }),

  isInfoComplete: Ember.computed('position', function(){
    return this.get('position') && this.get('position').length !== 0;
  })
});
