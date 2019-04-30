import Ember from "ember";
import config from "../../config/environment";
import AjaxPromise from "browse/utils/ajax-promise";
const { getOwner } = Ember;
import cancelOrder from "../../mixins/cancel_order";

export default Ember.Controller.extend(cancelOrder, {
  queryParams: ["prevPath"],
  prevPath: null,
  showCancelBookingPopUp: false,
  isMobileApp: config.cordova.enabled,
  myOrders: Ember.inject.controller(),
  firstName: null,
  lastName: null,
  mobilePhone: null,
  isEditing: false,
  selectedId: null,
  identityNumber: null,
  order: Ember.computed.alias("model.order"),
  beneficiary: Ember.computed.alias("model.beneficiary"),
  purposes: Ember.computed.alias("model.purposes"),

  isHkIdSelected: Ember.computed.equal("selectedId", "hkId"),
  isOrganisationSelected: Ember.computed.equal("clientInfoId", "organisation"),

  clientInfoId: Ember.computed("order", function() {
    let orderPurpose = this.get("order.ordersPurposes").get("firstObject");
    return (
      (orderPurpose && orderPurpose.get("purpose.identifier")) || "organisation"
    );
  }),

  mobile: Ember.computed("mobilePhone", function() {
    return config.APP.HK_COUNTRY_CODE + this.get("mobilePhone");
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

  beneficiaryParams() {
    let title = Ember.$("select#title option")
      .toArray()
      .filter(title => title.selected === true)[0].value;
    var beneficieryParams = {
      first_name: this.get("firstName"),
      last_name: this.get("lastName"),
      title: title,
      identity_number: this.get("identityNumber"),
      phone_number: this.get("mobile"),
      order_id: this.get("order.id"),
      identity_type_id: this.identityTypeId()
    };
    return beneficieryParams;
  },

  identityTypeId() {
    return this.get("selectedId") === "hkId" ? 1 : 2;
  },

  actionType(isOrganisation, beneficiaryId) {
    let actionType;
    if (isOrganisation && beneficiaryId) {
      actionType = "DELETE";
    } else if (!isOrganisation && beneficiaryId) {
      actionType = "PUT";
    } else if (!isOrganisation && !beneficiaryId) {
      actionType = "POST";
    } else {
      actionType = null;
    }
    return actionType;
  },

  actions: {
    saveClientDetails() {
      let orderParams;
      let clientInfo = this.get("clientInfoId");
      let purposeId = this.get("purposes")
        .filterBy("identifier", clientInfo)
        .get("firstObject.id");

      const isForOrganisation = clientInfo === "organisation";
      orderParams = isForOrganisation
        ? {
            purpose_ids: [purposeId],
            beneficiary_id: null
          }
        : {
            purpose_ids: [purposeId]
          };

      this.send("editOrder", orderParams, isForOrganisation);
    },

    /* jshint ignore:start */
    async editOrder(orderParams, isOrganisation) {
      let order = this.get("order");
      let orderId = order.id;
      let beneficiaryId = order.get("beneficiary.id");
      let store = this.store;
      let beneficiaryResponse;
      let url = beneficiaryId
        ? "/beneficiaries/" + beneficiaryId
        : "/beneficiaries";
      let actionType = this.actionType(isOrganisation, beneficiaryId);
      let beneficiary =
        beneficiaryId && store.peekRecord("beneficiary", beneficiaryId);
      let beneficiaryParams =
        ["PUT", "POST"].indexOf(actionType) > -1
          ? { beneficiary: this.beneficiaryParams(), order_id: orderId }
          : {};
      let loadingView = getOwner(this)
        .lookup("component:loading")
        .append();

      if (actionType) {
        beneficiaryResponse = await new AjaxPromise(
          url,
          actionType,
          this.get("session.authToken"),
          beneficiaryParams
        );
        orderParams["beneficiary_id"] = beneficiaryResponse.beneficiary
          ? beneficiaryResponse.beneficiary.id
          : null;
      }

      let orderResponse = await new AjaxPromise(
        "/orders/" + orderId,
        "PUT",
        this.get("session.authToken"),
        { order: orderParams }
      );
      store.pushPayload(orderResponse);

      if (beneficiary && actionType === "DELETE") {
        store.unloadRecord(beneficiary);
      } else {
        store.pushPayload(beneficiaryResponse);
      }
      this.send("redirectToGoodsDetails");
      loadingView.destroy();
    },
    /* jshint ignore:end */

    redirectToGoodsDetails() {
      let order = this.get("order");
      let orderId = order.id;
      var previousRouteName = this.get("prevPath");

      if (previousRouteName === "orders.booking") {
        this.transitionToRoute(previousRouteName, orderId);
      } else {
        let nextRoute = `order.${
          this.get("order.isAppointment") ? "goods_details" : "schedule_details"
        }`;
        this.transitionToRoute(nextRoute, orderId, {
          queryParams: { fromClientInformation: true }
        });
      }
    }
  }
});
