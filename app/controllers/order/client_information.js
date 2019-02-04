import Ember from "ember";
import config from '../../config/environment';
import AjaxPromise from 'browse/utils/ajax-promise';
const { getOwner } = Ember;
import cancelOrder from '../../mixins/cancel_order';

export default Ember.Controller.extend(cancelOrder, {
  showCancelBookingPopUp: false,
  isMobileApp: config.cordova.enabled,
  myOrders: Ember.inject.controller(),
  previousRouteName: null,
  firstName: null,
  lastName: null,
  mobilePhone: null,
  isEditing: false,
  selectedId: null,
  identityNumber: null,
  order: Ember.computed.alias("model.order"),
  beneficiary: Ember.computed.alias("model.beneficiary"),

  isHkIdSelected: Ember.computed.equal("selectedId", "hkId"),
  isOrganisationSelected: Ember.computed.equal("clientInfoId", "organisation"),

  clientInfoId: Ember.computed('order', function() {
    let orderPurpose = this.get('order.ordersPurposes').get('firstObject');
    return (orderPurpose && orderPurpose.get('purpose.identifier')) || 'organisation';
  }),

  mobile: Ember.computed('mobilePhone', function(){
    return config.APP.HK_COUNTRY_CODE + this.get('mobilePhone');
  }),

  titles: Ember.computed(function() {
    let translation = this.get("i18n");
    let mr = translation.t("account.user_title.mr");
    let mrs = translation.t("account.user_title.mrs");
    let miss = translation.t("account.user_title.miss");
    let ms = translation.t("account.user_title.ms");

    return [
      { name: mr, id: "Mr" },
      { name: mrs, id: "Mrs" },
      { name: miss, id: "Miss" },
      { name: ms, id: "Ms" }
    ];
  }),

  beneficiaryParams(){
    let title = Ember.$("select#title option").toArray().filter((title) => title.selected === true)[0].value;
    var beneficieryParams = {
      first_name: this.get('firstName'),
      last_name: this.get('lastName'),
      title: title,
      identity_number: this.get('identityNumber'),
      phone_number: this.get('mobile'),
      order_id: this.get('order.id'),
      identity_type_id: this.identityTypeId(),
    };
    return beneficieryParams;
  },

  identityTypeId(){
    return this.get('selectedId') === 'hkId' ? 1 : 2;
  },

  actions: {
    saveClientDetails(){
      let order = this.get('order');
      let orderId = order.id;
      let beneficiaryId = order.get('beneficiary.id');
      let purposeIds = [];
      let clientInfo = this.get('clientInfoId');

      if(clientInfo === 'organisation'){
        purposeIds.push(1);
      } else if(clientInfo === 'client'){
        purposeIds.push(2);
      }

      let url, actionType;

      if (beneficiaryId) {
        url = "/beneficiaries/" + beneficiaryId;
        actionType = "PUT";
      } else {
        url = "/beneficiaries";
        actionType = "POST";
      }

      let loadingView = getOwner(this).lookup('component:loading').append();

      if (clientInfo === 'organisation') {
        let orderParams = {
          'purpose_ids': purposeIds,
          'beneficiary_id': null
        };

        new AjaxPromise('/orders/' + orderId, 'PUT', this.get('session.authToken'), { order: orderParams })
        .then(data => {
          this.store.pushPayload(data);
          if (beneficiaryId) {
            let beneficiary = this.store.peekRecord('beneficiary', beneficiaryId);
            if(beneficiary) {
              new AjaxPromise("/beneficiaries/" + beneficiaryId, 'DELETE', this.get('session.authToken'))
              .then(() => {
                this.store.unloadRecord(beneficiary);
                loadingView.destroy();
              });
            }
          }
          this.send('redirectToGoodsDetails');
        });
      } else {
        let orderParams = {
          'purpose_ids': purposeIds
        };

        new AjaxPromise('/orders/' + orderId, 'PUT', this.get('session.authToken'), { order: orderParams })
        .then(() => {
          new AjaxPromise(url, actionType, this.get('session.authToken'), { beneficiary: this.beneficiaryParams(), order_id: orderId })
          .then(data => {
            this.get("store").pushPayload(data);
            loadingView.destroy();
            this.send('redirectToGoodsDetails', true);
          });
        });
      }
    },

    redirectToGoodsDetails(isClientInformation=false) {
      let order = this.get("order");
      let orderId = order.id;

      if(this.get("previousRouteName") === "my_orders") {
        this.get("myOrders").set("selectedOrder", order);
        this.transitionToRoute('my_orders');
      } else {
        if (isClientInformation) {
          this.transitionToRoute('order.goods_details', orderId, { queryParams: { fromClientInformation: true }});
        } else {
          this.transitionToRoute('order.goods_details', orderId);
        }
      }
    }
  }
});
