import Ember from "ember";
import config from "../config/environment";

const LS = window.localStorage;
const ENV = config.environment;
const isProd = /^prod/.test(ENV);

// --- Helpers

function serialize(data) {
  return JSON.stringify({ data });
}

function deserialize(str) {
  try {
    const obj = JSON.parse(str);
    return obj && obj.data;
  } catch (e) {
    console.error(e);
    return null;
  }
}

function prefixKey(key) {
  if (isProd) {
    return key;
  }
  return `${ENV}/${key}`;
}

// --- Service

export default Ember.Service.extend({
  read(key, defaultValue) {
    const fullKey = prefixKey(key);
    return deserialize(LS.getItem(fullKey)) || defaultValue;
  },

  write(key, val) {
    const fullKey = prefixKey(key);
    LS.setItem(fullKey, serialize(val));
    return val;
  },

  remove(key) {
    LS.removeItem(prefixKey(key));
  }
});
