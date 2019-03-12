import FactoryGuy from "ember-data-factory-guy";

FactoryGuy.define("address", {
  sequences: {
    id: function() {
      return Math.floor(Math.random() * 100);
    }
  },
  default: {
    id: FactoryGuy.generate("id"),
    flat: "24",
    building: "Crossroads",
    street: "Tai chung"
  }
});
export default {};
