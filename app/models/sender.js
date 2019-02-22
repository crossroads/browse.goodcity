import Ember from 'ember';
import Model from 'ember-data/model';
import attr from 'ember-data/attr';

export default Model.extend({
  firstName: attr('string'),
  lastName: attr('string'),
  mobile: attr('string'),
  createdAt: attr('date'),
  email: attr('string'),
  title: attr('string'),

  fullName: Ember.computed('firstName', 'lastName', function () {
    return (this.get("title") + " " + this.get('firstName') + " " + this.get('lastName'));
  }),
});
