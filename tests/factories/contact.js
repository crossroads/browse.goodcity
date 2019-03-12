import FactoryGuy from "ember-data-factory-guy";

FactoryGuy.define("contact", {
  sequences: {
    name: function(num) {
      return "Daniel" + num;
    }
  },
  default: {
    name: FactoryGuy.generate("name"),
    mobile: "611111"
  }
});
export default {};
