import Ember from 'ember';
import AjaxPromise from 'browse/utils/ajax-promise';
const { getOwner } = Ember;
import applicationController from './application';

export default applicationController.extend({
  description: "",

  organisation: false,
  client: false,
  trade: false,
  messageBox: Ember.inject.service(),
  i18n: Ember.inject.service(),

  order: Ember.computed.alias('session.draftOrder'),

  blankPurpose: Ember.computed("organisation", 'client', 'trade', {
    get() {
      return !(this.get("organisation") || this.get('client') || this.get('trade'));
    },
    set(key, value) {
      return value;
    }
  }),

  actions: {
    clearDescription() {
      this.set("description", "");
    },

    save_order() {
      var cartHasItems = this.get("cart.cartItems").length;
      if(!cartHasItems) {
        this.get("messageBox").alert(this.get("i18n").t("order.order_detail_pop_up"), () => {
          this.transitionToRoute("index");
        });
        return false;
      }
      var _this = this;
      var url, method;
      var order = this.get("store").peekAll("order").filterBy("detailType", "GoodCity").filterBy("state", "draft").get("firstObject");
      var description = this.get("description");
      var purpose_ids = [];
      var package_ids = [];
      var user_organisation_id;
      if(this.model && this.model.user && this.model.user.get('organisationsUsers').length){
        user_organisation_id = this.model.user.get('organisationsUsers.firstObject.organisationId');
      }

      if(this.get("organisation")) { purpose_ids.push(1); }
      if(this.get("client")) { purpose_ids.push(2); }
      if(this.get("trade")) { purpose_ids.push(3); }

      if(purpose_ids.length === 0) {
        this.set("blankPurpose", true);
        return false;
      }

      var loadingView = getOwner(this).lookup('component:loading').append();

      this.get("cart.cartItems").forEach(record => {
        if(record) {
          var ids = record.get("isItem") ? record.get("packages").map(pkg => pkg.get("id")) : [record.get("id")];
          package_ids = package_ids.concat(ids);
        }
      });

      var orderParams = {
        organisation_id: user_organisation_id,
        purpose_description: description,
        state: "draft",
        purpose_ids: purpose_ids,
        cart_package_ids: package_ids
      };

      if(order && order.get("isDraft")) {
        url = "/orders/" + order.get("id");
        method = "PUT";
      } else {
        url = "/orders";
        method = "POST";
      }

      new AjaxPromise(url, method, this.get('session.authToken'), { order: orderParams })
        .then(data => {
          this.get("store").pushPayload(data);
          if(data.order.state === "draft") {
            _this.set("description", data.order.purpose_description);
            purpose_ids = data.orders_purposes.filterBy("order_id", data.order.id).getEach("purpose_id");
            purpose_ids.forEach(id => {
              switch (id) {
                case 1:
                  this.set("organisation", true);
                  break;
                case 2:
                  this.set("client", true);
                  break;
                case 3:
                  this.set("trade", true);
                  break;
              }
            });
          }
          loadingView.destroy();
          this.transitionToRoute("order.transport_details", data.order.id);
        });
    }
  }
});
