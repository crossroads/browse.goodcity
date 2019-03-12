import FactoryGuy from "ember-data-factory-guy";

FactoryGuy.define("booking_type", {
  sequences: {
    id: function(num) {
      return num + 100;
    }
  },
  default: {
    id: FactoryGuy.generate("id"),
    nameEn: "appointment"
  }
});
export default {};
