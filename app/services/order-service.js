import { inject as service } from "@ember/service";
import ApiService from "./api-base-service";
import DS from "ember-data";
import _ from "lodash";

// ---- Helpers

function ID(recordOrId) {
  if (recordOrId instanceof DS.Model) {
    return recordOrId.get("id"); // model
  }
  return recordOrId; // id
}

function ORDER_URL(order) {
  return `/orders/${ID(order)}`;
}

// ---- Implementation

/**
 * Order service
 *
 */
export default ApiService.extend({
  store: service(),
  i18n: service(),

  /**
   * Transitions an order to a state
   *
   * @param {Order|string} orderOrId - The order record or its order
   * @param {string} transition - The transition to apply
   * @return {Object} the json response
   */
  applyStateTransition(orderOrId, transition, props = {}) {
    const url = ORDER_URL(orderOrId) + "/transition";

    return this.PUT(url, _.extend({ transition }, props)).then(data => {
      this.get("store").pushPayload(data);
      return data;
    });
  },

  /**
   * Applies the 'submit' transition
   *
   * @param {Order} order - The order to submit
   * @return {Object} the json response
   */
  submitOrder(order) {
    return this.applyStateTransition(order, "submit");
  },

  /**
   * Applies the 'cancel' transition
   *
   * @param {Order} order - The order to submit
   * @param {string} reason - The cancellation reason
   * @return {Object} the json response
   */
  cancelOrder(order, reason) {
    const cancellationReasons = this.get("store").peekAll(
      "cancellation_reason"
    );
    const defaultReason = this.get("i18n").t("order.default_reason").string;
    const cancellationReason = cancellationReasons.findBy(
      "name",
      defaultReason
    );
    const cancellationReasonId = cancellationReason && cancellationReason.id;
    return this.applyStateTransition(order, "cancel", {
      cancel_reason: reason,
      cancellation_reason_id: cancellationReasonId
    });
  },

  /**
   * Deletes an order, if the order is loaded it will be removed from the
   * store
   *
   * @param {Order|string} order - The order or its ID
   */
  deleteOrder(order) {
    const url = ORDER_URL(order);
    const store = this.get("store");

    return this.DELETE(url).then(() => {
      const localRecord = store.peekRecord("order", ID(order));
      if (localRecord) {
        store.unloadRecord(localRecord);
      }
    });
  },

  /**
   * Fetches all orders from the API
   *
   * @param {Object} options={} - Query options
   * @param {boolean} options.shallow=false - Query options
   * @return {Order[]} all the user's orders
   */
  loadAll(opts = {}) {
    const { shallow = false } = opts;
    const store = this.get("store");

    return store.query("order", { shallow }).then(() => {
      return store.peekAll("order");
    });
  },

  /**
   * Fetches the order transports of the orders currently in store
   *
   * @return {OrderTransport[]} all the user's order transports
   */
  loadOrderTransports() {
    const order_ids = this.get("store")
      .peekAll("order")
      .mapBy("id")
      .join(",");
    return this.get("store").query("order_transport", { order_ids });
  },

  /**
   * Finds the most recent draft order or appointment
   *
   * @param {Object} options - Query options
   * @param {boolean} options.appointment - Whether we're looking for an appointment
   * @return {Order} the editable draft order or appointment
   */
  getLastDraft({ appointment }) {
    return this.fetchOrdersOfType({ appointment }).then(orders => {
      return orders
        .filterBy("state", "draft")
        .sortBy("createdAt:desc")
        .get("firstObject");
    });
  },

  fetchOrdersOfType({ appointment }) {
    return this.loadAll({ shallow: true }).then(orders => {
      return orders.filterBy("isAppointment", appointment);
    });
  },

  hasSubmittedOrders() {
    return this.fetchOrdersOfType({ appointment: false }).then(orders => {
      const hasSubmittedOrder = orders.some(this.isOrderSubmittedOrProcessed);
      return hasSubmittedOrder;
    });
  },

  isOrderSubmittedOrProcessed(order) {
    const orderState = order.get("state");
    return ["submitted", "processing"].includes(orderState);
  },

  async updateBeneficiary(beneficiaryId, action = "POST", params) {
    const url = beneficiaryId
      ? `/beneficiaries/${beneficiaryId}`
      : `/beneficiaries/`;
    const actionMapper = {
      DELETE: this.DELETE,
      POST: this.POST,
      PUT: this.PUT
    };
    const method = actionMapper[action];
    const response = await method.call(this, url, params);
    if (action === "DELETE") {
      const beneficiary = this.get("store").peekRecord(
        "beneficiary",
        beneficiaryId
      );

      this.get("store").unloadRecord(beneficiary);
    } else {
      this.get("store").pushPayload(response);
    }
    return response;
  },

  async updateOrder(order, params = {}, cb = _.noop) {
    const url = ORDER_URL(order.get("id"));
    const data = await this.PUT(url, params);
    this.get("store").pushPayload(data);
    cb(data);
    return data;
  },

  async createGoodsDetails(orderId, params) {
    const url = `/goodcity_requests`;
    const data = await this.POST(url, {
      goodcity_request: {
        quantity: params.quantity,
        order_id: orderId,
        package_type_id: params.packageTypeId
      }
    });
    this.get("store").pushPayload(data);
    return data;
  },

  async updateGoodsDetails(orderId, params) {
    const url = `/goodcity_requests/${params.id}`;
    const data = await this.PUT(url, {
      goodcity_request: {
        quantity: params.quantity,
        order_id: orderId,
        package_type_id: params.packageTypeId
      }
    });
    this.get("store").pushPayload(data);
    return data;
  },

  async deleteGoodsDetails(id) {
    const url = `/goodcity_requests/${id}`;
    const data = await this.DELETE(url);
    this.get("store").pushPayload(data);
  }
});
