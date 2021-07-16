import _ from "lodash";

/********************/
/* Helper functions */
/********************/

/**
 *
 * @export
 * @param {Model|string} modelOrId
 * @returns {string}
 */
export function toID(modelOrId) {
  if (modelOrId.get) {
    return modelOrId.get("id");
  }
  return modelOrId;
}

export function containsAny(str, substrings) {
  for (var i = 0; i !== substrings.length; i++) {
    var substring = substrings[i];
    if (str.indexOf(substring) !== -1) {
      return true;
    }
  }
  return false;
}
