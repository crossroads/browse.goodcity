import Ember from 'ember';
import AuthorizeRoute from './../authorize';
import AjaxPromise from 'browse/utils/ajax-promise';

export default AuthorizeRoute.extend({
  model() {
    return Ember.RSVP.hash({
      availableDates: new AjaxPromise("/available_dates", "GET", this.get('session.authToken'), {schedule_days: 40}),
      order: this.store.peekRecord('order', this.paramsFor('order').order_id)
    });
  },

  setUpFormData(model, controller) {
    controller.set('selectedId', "self");
    controller.set('selectedTimeId', "11:00am");
    controller.set('available_dates', model.availableDates);
  },

  setupController(controller, model) {
    this._super(...arguments);
    this.setUpFormData(model, controller);
  }
});
