import Ember from "ember";
import AjaxPromise from 'browse/utils/ajax-promise';
const { getOwner } = Ember;

export default Ember.Controller.extend({
  peopleCount: null,
  description: "",
  selectedId: null,
  isSelfSelected: Ember.computed.equal("selectedId", "organisation"),
  user: Ember.computed.alias('session.currentUser'),

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
        state: "draft",
        purpose_ids: purposeIds,
        people_helped: this.get('peopleCount')
      };

      var loadingView = getOwner(this).lookup('component:loading').append();

      var isOrganisationPuropose = false;

      new AjaxPromise("/orders", "POST", this.get('session.authToken'), { order: orderParams })
        .then(data => {
          this.get("store").pushPayload(data);
          var orderId = data.order.id;
          var purpose_ids = data.orders_purposes.filterBy("order_id", data.order.id).getEach("purpose_id");
          isOrganisationPuropose = purpose_ids.get('length') === 1 && purpose_ids.indexOf(1) >= 0;
          loadingView.destroy();
          if(isOrganisationPuropose){
            this.transitionToRoute('order.goods_details', orderId);
          } else {
            this.transitionToRoute("order.client_information", orderId);
          }
        });
    }
  }
});
