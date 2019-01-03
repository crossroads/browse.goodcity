import Ember from "ember";
import AjaxPromise from 'browse/utils/ajax-promise';
const { getOwner } = Ember;
import config from "../config/environment";

export default Ember.Controller.extend({
  isMobileApp: config.cordova.enabled,
  myOrders: Ember.inject.controller(),
  queryParams: ["orderId", "editRequest"],
  editRequest: null,
  previousRouteName: null,
  orderId: null,
  isEditing: false,
  peopleCount: null,
  description: "",
  selectedId: null,
  isSelfSelected: Ember.computed.equal("selectedId", "organisation"),
  user: Ember.computed.alias('session.currentUser'),

  selectedDistrict: null,

  districts: Ember.computed(function(){
    return this.store.peekAll('district');
  }),


  actions: {
    clearDescription() {
      this.set("description", "");
    },

    createOrderWithRequestPuropose(){
      var user = this.get('user');
      var purposeIds = [];
      if(this.get('selectedId') === 'organisation'){
        purposeIds.push(1);
      } else if(this.get('selectedId') === 'client'){
        purposeIds.push(2);
      }

      var user_organisation_id;
      if(user && user.get('organisationsUsers').length){
        user_organisation_id = user.get('organisationsUsers.firstObject.organisationId');
      }

      var orderParams = {
        organisation_id: user_organisation_id,
        purpose_description: this.get('description'),
        purpose_ids: purposeIds,
        order_type: 'appointment',
        people_helped: this.get('peopleCount'),
        district_id: this.get('selectedDistrict.id')
      };

      let order = this.get('model');
      let url = "/orders";
      let actionType = "POST";
      if(order) {
        url = "/orders/" + order.get('id');
        actionType = "PUT";
      }

      var loadingView = getOwner(this).lookup('component:loading').append();

      var isOrganisationPuropose = false;

      new AjaxPromise(url, actionType, this.get('session.authToken'), { order: orderParams })
        .then(data => {
          this.get("store").pushPayload(data);
          var orderId = data.order.id;
          var purpose_ids = data.orders_purposes.filterBy("order_id", data.order.id).getEach("purpose_id");
          isOrganisationPuropose = purpose_ids.get('length') === 1 && purpose_ids.indexOf(1) >= 0;
          loadingView.destroy();
          if(this.get("previousRouteName") === "my_orders") {
            this.get("myOrders").set("selectedOrder", this.get("store").peekRecord("order", orderId));
            this.transitionToRoute('my_orders');
          } else if(isOrganisationPuropose) {
            this.transitionToRoute('order.goods_details', orderId);
          } else {
            this.transitionToRoute("order.client_information", orderId);
          }
        });
    }
  }
});
