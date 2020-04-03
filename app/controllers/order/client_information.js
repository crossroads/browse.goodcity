import $ from "jquery";
import { computed } from "@ember/object";
import { inject as service } from "@ember/service";
import { alias, equal } from "@ember/object/computed";
import Controller, { inject as controller } from "@ember/controller";
import { getOwner } from "@ember/application";
import config from "../../config/environment";
import AjaxPromise from "browse/utils/ajax-promise";
import cancelOrder from "../../mixins/cancel_order";
import { task } from "ember-concurrency";

export default Controller.extend(cancelOrder, {
  queryParams: ["prevPath"],
  prevPath: null,
  showCancelBookingPopUp: false,
  isMobileApp: config.cordova.enabled,
  myOrders: controller(),
  firstName: null,
  lastName: null,
  mobilePhone: null,
  isEditing: false,
  selectedId: null,
  identityNumber: null,
  order: alias("model.order"),
  beneficiary: alias("model.beneficiary"),
  purposes: alias("model.purposes"),
  messageBox: service(),

  isHkIdSelected: equal("selectedId", "hkId"),
  isOrganisationSelected: equal("clientInfoId", "organisation"),

  clientInfoId: computed("order", function() {
    let orderPurpose = this.get("order.ordersPurposes").get("firstObject");
    return (
      (orderPurpose && orderPurpose.get("purpose.identifier")) || "organisation"
    );
  }),

  mobile: computed("mobilePhone", function() {
    return config.APP.HK_COUNTRY_CODE + this.get("mobilePhone");
  }),

  isAppointment: alias("order.isAppointment"),

  titles: computed(function() {
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
    let title = $("select#title option")
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

  editOrder: task(function*(orderParams, isOrganisation) {
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
      beneficiaryResponse = yield new AjaxPromise(
        url,
        actionType,
        this.get("session.authToken"),
        beneficiaryParams
      );
      orderParams["beneficiary_id"] = beneficiaryResponse.beneficiary
        ? beneficiaryResponse.beneficiary.id
        : null;
    }

    let orderResponse = yield new AjaxPromise(
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
  }),

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

      this.get("editOrder").perform(orderParams, isForOrganisation);
    },

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
