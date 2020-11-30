import $ from "jquery";
import { computed } from "@ember/object";
import { alias, equal } from "@ember/object/computed";
import Controller, { inject as controller } from "@ember/controller";
import { getOwner } from "@ember/application";
import config from "../../config/environment";
import AjaxPromise from "browse/utils/ajax-promise";
import CancelOrder from "../../mixins/cancel_order";
import AsyncMixin from "browse/mixins/async_tasks";

export default Controller.extend(CancelOrder, AsyncMixin, {
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

  beneficiaryParams() {
    return {
      first_name: this.get("firstName"),
      last_name: this.get("lastName"),
      title: this.get("selectedTitle.name").toString(),
      identity_number: this.get("identityNumber"),
      phone_number: this.get("mobile"),
      order_id: this.get("order.id"),
      identity_type_id: this.identityTypeId()
    };
  },

  identityTypeId() {
    return this.get("selectedId") === "hkId" ? 1 : 2;
  },

  beneficiaryAction(forBeneficiary, beneficiaryId) {
    if (!forBeneficiary && beneficiaryId) {
      return "DELETE";
    } else if (forBeneficiary && beneficiaryId) {
      return "PUT";
    } else if (forBeneficiary && !beneficiaryId) {
      return "POST";
    } else {
      return null;
    }
  },

  async updateOrder(forBeneficiary) {
    const order = this.get("order");
    const beneficiary = order.get("beneficiary");
    const beneficiaryAction = this.beneficiaryAction(
      forBeneficiary,
      beneficiary.get("id")
    );
    const orderParams = this.getOrderParams();
    let loadingView = getOwner(this)
      .lookup("component:loading")
      .append();
    try {
      if (beneficiaryAction) {
        const response = await this.get("orderService").updateBeneficiary(
          beneficiary.get("id"),
          beneficiaryAction,
          {
            orderId: order.get("id"),
            beneficiary: this.beneficiaryParams()
          }
        );
        orderParams["beneficiary_id"] = response.beneficiary
          ? response.beneficiary.id
          : null;
      }

      await this.get("orderService").updateOrder(
        order,
        { order: orderParams },
        () => {
          this.send("redirectToGoodsDetails");
        }
      );

      loadingView.destroy();
    } catch (error) {
      loadingView.destroy();
      throw error;
    }
  },

  getOrderParams() {
    const clientInfo = this.get("clientInfoId");
    const purposeId = this.get("purposes")
      .filterBy("identifier", clientInfo)
      .get("firstObject.id");

    return {
      purpose_ids: [purposeId],
      beneficiary_id: null
    };
  },

  actions: {
    onTitleChange(title) {
      this.set("selectedTitle", title);
    },

    saveClientDetails() {
      const forBeneficiary = this.get("clientInfoId") === "client";
      this.updateOrder(forBeneficiary);
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
