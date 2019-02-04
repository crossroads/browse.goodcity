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
    saveClientDetails() {
      let orderParams;
      let clientInfo = this.get('clientInfoId');

      if (clientInfo === 'organisation') {
        orderParams = {
          'purpose_ids': [1],
          'beneficiary_id': null
        };

        this.send('editOrder', orderParams);
      } else if (clientInfo === 'client') {
        orderParams = {
          'purpose_ids': [2]
        };

        this.send('editOrder', orderParams, false);
      }

    },

    editOrder(orderParams, isOrganisation=true) {
      let order = this.get('order');
      let orderId = order.id;
      let beneficiaryId = order.get('beneficiary.id');
      let store = this.store;

      let url, actionType;
      let loadingView = getOwner(this).lookup('component:loading').append();

      if (beneficiaryId) {
        url = "/beneficiaries/" + beneficiaryId;
        actionType = "PUT";
      } else {
        url = "/beneficiaries";
        actionType = "POST";
      }


      new AjaxPromise('/orders/' + orderId, 'PUT', this.get('session.authToken'), { order: orderParams })
        .then(data => {
          store.pushPayload(data);
          if (isOrganisation) {
            if (beneficiaryId) {
              let beneficiary = store.peekRecord('beneficiary', beneficiaryId);
              new AjaxPromise(url, 'DELETE', this.get('session.authToken'))
              .then(() => {
                store.unloadRecord(beneficiary);
              });
            }
            this.send('redirectToGoodsDetails');
          } else {
            new AjaxPromise(url, actionType, this.get('session.authToken'), { beneficiary: this.beneficiaryParams(), order_id: orderId })
            .then(data => {
              store.pushPayload(data);
              this.send('redirectToGoodsDetails', true);
            });
          }
        })
        .finally(() => {
          loadingView.destroy();
        });

    },

    redirectToGoodsDetails(isClientInformation=false) {
      let order = this.get("order");
      let orderId = order.id;

      if (this.get("previousRouteName") === "my_orders") {
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
