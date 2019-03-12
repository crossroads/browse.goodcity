import Model from "ember-data/model";
import { belongsTo } from "ember-data/relationships";

var Addressable = Model.extend({
  address: belongsTo("address", { async: false })
});

export default Addressable;
