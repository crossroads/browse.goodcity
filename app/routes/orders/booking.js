import detail from './detail';

export default detail.extend({
  setupController(controller, model){
    // if(controller) {
      this._super(controller, model);
      controller.set('isBooking', true);
    // }
  }
});
