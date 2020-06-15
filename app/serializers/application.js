import { ActiveModelSerializer } from "active-model-adapter";
import _ from "lodash";

/*
Ember is unable to pickup the polymorphic association with the hasMany relationship for messages
We are intercepting the payload response and mapping the messageable_id with the order_id
*/
function normalize(payload) {
  const messages = _.flatten([payload.messages, payload.message]).filter(
    _.identity
  );

  _.each(messages, m => {
    if (m.messageable_type == "Order") {
      m.order_id = m.messageable_id;
    }

    // This is done to handle inconsistent mapping of jsonb datatype
    if (typeof m.lookup === "object") {
      m.lookup = JSON.stringify(m.lookup);
    }
  });
}

export default ActiveModelSerializer.extend({
  normalizeResponse(store, primaryModelClass, payload, id, requestType) {
    normalize(payload);
    return this._super(...arguments);
  },

  pushPayload(store, payload) {
    normalize(payload);
    return this._super(...arguments);
  }
});
