import Ember from "ember";
import AjaxPromise from 'browse/utils/ajax-promise';
const { getOwner } = Ember;
import config from "../config/environment";
import cancelOrder from '../mixins/cancel_order';

export default Ember.Controller.extend(cancelOrder, {
  showCancelBookingPopUp: false,
  isMobileApp: config.cordova.enabled,
  myOrders: Ember.inject.controller(),
  queryParams: ["orderId", "editRequest", "bookAppointment", 'prevPath'],
  prevPath: null,
  editRequest: null,
  orderId: null,
  isEditing: false,
  bookAppointment: false,
  peopleCount: null,
  description: "",
  order: Ember.computed.alias("model"),
  selectedId: null,
  isSelfSelected: Ember.computed.equal("selectedId", "organisation"),
  user: Ember.computed.alias('session.currentUser'),
  cart: Ember.inject.service(),
  messageBox: Ember.inject.service(),

  selectedDistrict: null,

  districts: Ember.computed(function(){
    return this.store.peekAll('district');
  }),

  getBookingTypeIdFor(identifier) {
    return this.store.peekAll('booking_type').filterBy('identifier', identifier).get('firstObject.id');
  },

  getSelectedBookingTypeId() {
    let order = this.get('model');
    let bookingTypeId = order && order.get('bookingTypeId');
    if (!bookingTypeId) {
      bookingTypeId = this.getBookingTypeIdFor(this.get('bookAppointment') ? 'appointment' : 'online-order');
    }
    return bookingTypeId;
  },

  isOnlineOrder() {
    return this.getSelectedBookingTypeId() === this.getBookingTypeIdFor('online-order');
  },

  actions: {
    clearDescription() {
      this.set("description", "");
    },

    createOrderWithRequestPurpose(){
      if (this.isOnlineOrder()) {
        let cartHasItems = this.get("cart.cartItems").length;
        if(!cartHasItems) {
          this.get("messageBox").alert(this.get("i18n").t("order.order_detail_pop_up"), () => {
            this.transitionToRoute("index");
          });
          return false;
        }
      }

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

      let orderParams = {
        organisation_id: user_organisation_id,
        purpose_description: this.get('description'),
        purpose_ids: purposeIds,
        people_helped: this.get('peopleCount'),
        district_id: this.get('selectedDistrict.id'),
        booking_type_id: this.getSelectedBookingTypeId(),
        state: order ? order.get('state') : 'draft'
      };

      if (this.isOnlineOrder()) {
        orderParams.cart_package_ids = this.get('cart.packageIds');
      }

      let loadingView = getOwner(this).lookup('component:loading').append();

      new AjaxPromise(url, actionType, this.get('session.authToken'), { order: orderParams })
        .then(data => {
          this.get("store").pushPayload(data);

          let orderId = data.order.id;

          loadingView.destroy();
          if(this.get("prevPath") === "orders.booking" && this.get('editRequest')) {
            this.transitionToRoute('orders.booking', orderId);
          } else {
            this.transitionToRoute("order.client_information", orderId);
          }
        });
    }
  }
});