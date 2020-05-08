import { computed } from "@ember/object";
import { inject as service } from "@ember/service";
import { alias, equal } from "@ember/object/computed";
import Controller, { inject as controller } from "@ember/controller";
import { getOwner } from "@ember/application";
import AjaxPromise from "browse/utils/ajax-promise";
import config from "../config/environment";
import cancelOrder from "../mixins/cancel_order";

export default Controller.extend(cancelOrder, {
  showCancelBookingPopUp: false,
  isMobileApp: config.cordova.enabled,
  myOrders: controller(),
  queryParams: ["orderId", "editRequest", "bookAppointment", "prevPath"],
  prevPath: null,
  editRequest: null,
  orderId: null,
  isEditing: false,
  bookAppointment: false,
  peopleCount: null,
  description: "",
  order: alias("model"),
  selectedId: null,
  isSelfSelected: equal("selectedId", "organisation"),
  user: alias("session.currentUser"),
  cart: service(),
  messageBox: service(),

  selectedDistrict: null,

  districts: computed(function() {
    return this.store.peekAll("district").sortBy("name");
  }),

  getBookingTypeIdFor(identifier) {
    return this.store
      .peekAll("booking_type")
      .filterBy("identifier", identifier)
      .get("firstObject.id");
  },

  getSelectedBookingTypeId() {
    let order = this.get("model");
    let bookingTypeId = order && order.get("bookingTypeId");
    if (!bookingTypeId) {
      bookingTypeId = this.getBookingTypeIdFor(
        this.get("bookAppointment") ? "appointment" : "online-order"
      );
    }
    return bookingTypeId;
  },

  isOnlineOrder() {
    return (
      this.getSelectedBookingTypeId() ==
      this.getBookingTypeIdFor("online-order")
    );
  },

  actions: {
    clearDescription() {
      this.set("description", "");
    },

    createOrderWithRequestPurpose() {
      if (this.isOnlineOrder()) {
        let cartHasItems = this.get("cart.cartItems").length;
        if (!cartHasItems) {
          this.get("messageBox").alert(
            this.get("i18n").t("order.order_detail_pop_up"),
            () => {
              this.transitionToRoute("index");
            }
          );
          return false;
        }
      }

      let user = this.get("user");
      let user_organisation_id;
      if (user && user.get("organisationsUsers").length) {
        user_organisation_id = user.get(
          "organisationsUsers.firstObject.organisationId"
        );
      }

      let order = this.get("model");
      let url = "/orders";
      let actionType = "POST";
      if (order) {
        url = "/orders/" + order.get("id");
        actionType = "PUT";
      }

      let orderParams = {
        organisation_id: user_organisation_id,
        purpose_description: this.get("description"),
        purpose_ids: [],
        people_helped: Number(this.get("peopleCount")),
        district_id: this.get("selectedDistrict.id"),
        booking_type_id: this.getSelectedBookingTypeId(),
        state: order ? order.get("state") : "draft"
      };

      let loadingView = getOwner(this)
        .lookup("component:loading")
        .append();

      new AjaxPromise(url, actionType, this.get("session.authToken"), {
        order: orderParams
      })
        .then(data => {
          this.get("store").pushPayload(data);

          let orderId = data.order.id;
          loadingView.destroy();
          if (
            this.get("prevPath") === "orders.booking" &&
            this.get("editRequest")
          ) {
            this.transitionToRoute("orders.booking", orderId);
            this.set("prevPath", "null");
            this.set("editRequest", false);
          } else {
            this.transitionToRoute("order.client_information", orderId);
          }
        })
        .catch(err => {
          this.get("messageBox").alert(err.responseJSON.error, () =>
            this.transitionToRoute("/my_orders")
          );
        });
    },

    back() {
      let prevPageName = this.get("prevPath");
      let orderId = this.get("order.id") || this.get("orderId");
      if (["orders.goods", "orders.booking"].indexOf(prevPageName) >= 0) {
        this.transitionToRoute(prevPageName, orderId);
      } else if (["account_details", "my_orders"].indexOf(prevPageName) >= 0) {
        this.transitionToRoute(prevPageName);
      } else {
        this.transitionToRoute("home");
      }
    }
  }
});
