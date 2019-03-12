import FactoryGuy from "ember-data-factory-guy";

FactoryGuy.define("gogovan_transport", {
  sequences: {
    id: function(num) {
      return num + 100;
    }
  },
  default: {
    id: FactoryGuy.generate("id"),
    disabled: true
  }
});
export default {};
