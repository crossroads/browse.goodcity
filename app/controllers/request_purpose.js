import Ember from "ember";
import AjaxPromise from 'browse/utils/ajax-promise';
const { getOwner } = Ember;
import config from "../config/environment";
import cancelOrder from '../mixins/cancel_order';

export default Ember.Controller.extend(cancelOrder, {
  showCancelBookingPopUp: false,
  isMobileApp: config.cordova.enabled,
  myOrders: Ember.inject.controller(),
  queryParams: ["orderId", "editRequest", "bookAppointment"],
  editRequest: null,
  previousRouteName: null,
  orderId: null,
  isEditing: false,
  bookAppointment: false,
  peopleCount: null,
  description: "",
  order: Ember.computed.alias("model"),
  selectedId: null,
  isSelfSelected: Ember.computed.equal("selectedId", "organisation"),
  user: Ember.computed.alias('session.currentUser'),

  selectedDistrict: null,

  districts: Ember.computed(function(){
    return this.store.peekAll('district');
  }),

  getBookingTypeId(identifier) {
    return this.store.peekAll('booking_type').filterBy('identifier', identifier).get('firstObject.id');
  },

  actions: {
    clearDescription() {
      this.set("description", "");
    },

    createOrderWithRequestPuropose(){
      let user = this.get('user');
      let purposeIds = [];

      if (this.get('selectedId') === 'organisation'){
        purposeIds.push(1);
      } else if (this.get('selectedId') === 'client'){
        purposeIds.push(2);
      }

      let user_organisation_id;
      if(user && user.get('organisationsUsers').length){
        user_organisation_id = user.get('organisationsUsers.firstObject.organisationId');
      }

      let order = this.get('model');
      let url = "/orders";
      let actionType = "POST";
      if (order) {
        url = "/orders/" + order.get('id');
        actionType = "PUT";
      }

      let bookingTypeId = order && order.get('bookingTypeId');
      if (!bookingTypeId) {
        bookingTypeId = this.getBookingTypeId(this.get('bookAppointment') ? 'appointment' : 'online-order');
      }

      let isAppointment = Number(bookingTypeId) === Number(this.getBookingTypeId('appointment'));

      let orderParams = {
        organisation_id: user_organisation_id,
        purpose_description: this.get('description'),
        purpose_ids: purposeIds,
        people_helped: this.get('peopleCount'),
        district_id: this.get('selectedDistrict.id'),
        booking_type_id: bookingTypeId
      };

      let loadingView = getOwner(this).lookup('component:loading').append();

      new AjaxPromise(url, actionType, this.get('session.authToken'), { order: orderParams })
        .then(data => {
          this.get("store").pushPayload(data);

          let orderId = data.order.id;
          let purpose_ids = data.orders_purposes.filterBy("order_id", data.order.id).getEach("purpose_id");
          let isOrganisationPurpose = purpose_ids.get('length') === 1 && purpose_ids.indexOf(1) >= 0;

          loadingView.destroy();
          if(this.get("previousRouteName") === "my_orders" && this.get('editRequest')) {
            this.get("myOrders").set("selectedOrder", this.get("store").peekRecord("order", orderId));
            this.transitionToRoute('my_orders');
          } else if (isOrganisationPurpose) {
            this.transitionToRoute(`order.${isAppointment? 'goods_details' : 'schedule_details'}`, orderId);
          } else {
            this.transitionToRoute("order.client_information", orderId);
          }
        });
    }
  }
});
