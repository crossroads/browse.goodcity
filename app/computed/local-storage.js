import Ember from "ember";
import config from "../config/environment";

var storageSupported = false;
try {
  localStorage.test = 2;
  delete localStorage.test;
  storageSupported = true;
} catch (err) {
  console.log(err);
}

var cookiesSupported = false;
try {
  Ember.$.cookie("test", 2);
  Ember.$.removeCookie("test");
  cookiesSupported = true;
} catch (err) {
  console.log(err);
}

var localStorageProvider = {
  get(key) {
    return JSON.parse(localStorage[key] || null);
  },
  set(key, value) {
    if (Ember.isNone(value)) {
      delete localStorage[key];
    } else {
      localStorage[key] = JSON.stringify(value);
    }
    return value;
  }
};

var cookieStorageProvider = {
  get(key) {
    return Ember.$.cookie(key);
  },
  set(key, value) {
    Ember.$.cookie.json = true;
    if (Ember.isNone(value)) {
      Ember.$.removeCookie(key);
    } else {
      Ember.$.cookie(key, value, {
        expires: 365,
        path: "/",
        secure: config.environment === "production"
      });
    }
    return value;
  }
};

var memoryStorageProvider = {
  get(key) {
    if (!window.goodcityStorage) {
      window.goodcityStorage = {};
    }
    return window.goodcityStorage[key];
  },
  set(key, value) {
    if (!window.goodcityStorage) {
      window.goodcityStorage = {};
    }
    if (Ember.isNone(value)) {
      delete window.goodcityStorage[key];
    } else {
      window.goodcityStorage[key] = value;
    }
    return value;
  }
};

export default (Ember.computed.localStorage = function() {
  if (storageSupported) {
    return Ember.computed(localStorageProvider);
  }

  if (cookiesSupported) {
    return Ember.computed(cookieStorageProvider);
  }

  return Ember.computed(memoryStorageProvider);
});
