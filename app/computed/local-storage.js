import { computed } from "@ember/object";
import { isNone } from "@ember/utils";
import $ from "jquery";
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
  $.cookie("test", 2);
  $.removeCookie("test");
  cookiesSupported = true;
} catch (err) {
  console.log(err);
}

var localStorageProvider = {
  get(key) {
    return JSON.parse(localStorage[key] || null);
  },
  set(key, value) {
    if (isNone(value)) {
      delete localStorage[key];
    } else {
      localStorage[key] = JSON.stringify(value);
    }
    return value;
  }
};

var cookieStorageProvider = {
  get(key) {
    return $.cookie(key);
  },
  set(key, value) {
    $.cookie.json = true;
    if (isNone(value)) {
      $.removeCookie(key);
    } else {
      $.cookie(key, value, {
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
    if (isNone(value)) {
      delete window.goodcityStorage[key];
    } else {
      window.goodcityStorage[key] = value;
    }
    return value;
  }
};

export default computed.localStorage = function() {
  if (storageSupported) {
    return computed(localStorageProvider);
  }

  if (cookiesSupported) {
    return computed(cookieStorageProvider);
  }

  return computed(memoryStorageProvider);
};
