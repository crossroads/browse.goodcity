import Ember from "ember";
import _ from "lodash";
import config from "../config/environment";

function run(func) {
  if (func) {
    func();
  }
}

const ALL_OPERATIONS = ["create", "update", "delete"];

const UPDATE_STRATEGY = {
  RELOAD: (store, type, record) => {
    return store.findRecord(type, record.id);
  },
  MERGE: (store, type, record) => {
    store.pushPayload({ [type]: record });
  },
  SAVE_SENDER: (store, type, record, sender) => {
    store.pushPayload(sender);
  }
};

/**
 * Subscription service
 *
 */
export default Ember.Service.extend(Ember.Evented, {
  messagesUtil: Ember.inject.service("messages"),
  session: Ember.inject.service(),
  store: Ember.inject.service(),
  socket: null,
  lastOnline: Date.now(),
  deviceTtl: 0,
  deviceId: Ember.computed.alias("session.deviceId"),
  status: {
    online: false
  },
  connectUrl: Ember.computed("session.authToken", "deviceId", function() {
    return (
      config.APP.SOCKETIO_WEBSERVICE_URL +
      `?token=${encodeURIComponent(this.get("session.authToken"))}` +
      `&deviceId=${this.get("deviceId")}` +
      `&meta=appName:${config.APP.NAME}`
    );
  }),

  // -----------
  // Config
  // -----------
  unhandledTypes: [
    // those types will be ignored
    "offer"
  ],
  importStrategies: {
    // define how we handle incoming changes
    package: {
      strategy: UPDATE_STRATEGY.RELOAD
    },
    message: {
      strategy: [UPDATE_STRATEGY.MERGE, UPDATE_STRATEGY.SAVE_SENDER]
    },
    defaults: {
      operations: ALL_OPERATIONS,
      strategy: UPDATE_STRATEGY.MERGE
    }
  },
  internalTypeMapping: {
    // type renaming
    designation: "order"
  },

  // -----------
  // Watch
  // -----------
  updateStatus: Ember.observer("socket", function() {
    var socket = this.get("socket");
    var online = navigator.connection
      ? navigator.connection.type !== "none"
      : navigator.onLine;
    online = socket && socket.connected && online;
    this.set("status", { online: online });
  }),

  // resync if offline longer than deviceTtl
  checkdeviceTTL: Ember.observer("status.online", function() {
    let online = this.get("status.online");
    let deviceTtl = this.get("deviceTtl");

    if (!online) {
      this.set("lastOnline", Date.now());
      return;
    }

    let overtime = Date.now() - this.get("lastOnline") > deviceTtl * 1000;
    if (deviceTtl && overtime) {
      this.resync();
    }
  }),

  // -----------
  // Setup
  // -----------

  init() {
    var updateStatus = Ember.run.bind(this, this.updateStatus);
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);
  },

  wire() {
    let updateStatus = Ember.run.bind(this, this.updateStatus);
    let socket = io(this.get("connectUrl"), {
      autoConnect: false,
      forceNew: true
    });

    this.set("socket", socket);
    socket.on("connect", function() {
      updateStatus();
      socket.io.engine.on("upgrade", updateStatus);
    });
    socket.on("notification", Ember.run.bind(this, this.notification));
    socket.on("disconnect", updateStatus);
    socket.on("error", Ember.run.bind(this, this.error));
    socket.on("update_store", Ember.run.bind(this, this.update_store));
    socket.on("_batch", Ember.run.bind(this, this.batch));
    socket.on("_resync", Ember.run.bind(this, this.resync));
    socket.on(
      "_settings",
      Ember.run.bind(this, function(settings) {
        this.set("deviceTtl", settings.device_ttl);
        this.set("lastOnline", Date.now());
      })
    );
    socket.connect(); // manually connect since it's not auto-connecting if you logout and then back in
  },

  unwire() {
    var socket = this.get("socket");
    if (socket) {
      socket.close();
      this.set("socket", null);
    }
  },

  // -----------
  // Helpers
  // -----------

  getStrategy(type) {
    let defaultStrat = this.importStrategies.defaults;
    let typeStrat = this.importStrategies[type] || {};
    return _.extend({}, defaultStrat, typeStrat);
  },

  operationIsAllowed(operation, type) {
    let { operations } = this.getStrategy(type);
    return operations.indexOf(operation) >= 0;
  },

  resolveTypeAliases(type) {
    const typeMapping = this.get("internalTypeMapping");
    return typeMapping[type] || type;
  },

  parseData(data) {
    let { item: payload, operation, sender, device_id: deviceId } = data;
    let rawType = Object.keys(payload)[0].toLowerCase();
    let type = this.resolveTypeAliases(rawType);
    let record = Ember.$.extend({}, payload[rawType]);
    return { payload, record, operation, type, rawType, sender, deviceId };
  },

  isUnhandled(data) {
    let { operation, deviceId, rawType, type } = this.parseData(data);

    if (deviceId == this.get("deviceId")) {
      return true; // Change initiated by us
    }

    if (this.get("unhandledTypes").indexOf(rawType) >= 0) {
      console.warn(`[Subscription] Unhandled data type '${rawType}'`);
      return true;
    }

    if (!this.operationIsAllowed(operation, type)) {
      console.warn(
        `[Subscription] Ignoring a '${operation}' operation for type '${type}'`
      );
      return true;
    }
    return false;
  },

  applyUpdateStrategy(record, type, sender) {
    const store = this.get("store");
    const { strategy } = this.getStrategy(type);
    const tasks = _.flatten([strategy]);
    const promises = tasks.map(fn => fn(store, type, record, sender));
    return Ember.RSVP.all(promises);
  },

  // -----------
  // Socket hooks
  // -----------

  notification: function(data, success) {
    this.trigger("notification", data);
    run(success);
  },

  error(reason) {
    if (
      typeof reason !== "object" ||
      (reason.type !== "TransportError" && reason.message !== "xhr post error")
    ) {
      console.warn(`[Subscription] Socker error`, reason);
    }
  },

  batch: function(events, success) {
    events.forEach(function(args) {
      var event = args[0];
      if (this[event]) {
        this[event].apply(this, args.slice(1));
      }
    }, this);
    run(success);
  },

  resync: function() {
    this.get("store").findAll("item");
  },

  update_store(data, success) {
    if (this.isUnhandled(data)) {
      return false;
    }

    let { record, operation, deviceId, type, sender } = this.parseData(data);
    let task = Ember.RSVP.resolve(true);

    switch (operation) {
      case "create":
      case "update":
        task = this.applyUpdateStrategy(record, type, sender);
        break;
      case "delete":
        let existingItem = this.get("store").peekRecord(type, record.id);
        if (existingItem) {
          this.get("store").unloadRecord(existingItem);
        }
        break;
      default:
        console.error(`[Subscription] Unsupported operation '${operation}'`);
        return false;
    }

    task.then(() => {
      this.trigger(`change:${type}`, { type, operation, record });
      run(success);
    });
    return true;
  }
});
