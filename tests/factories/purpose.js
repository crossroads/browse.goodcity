import FactoryGuy from "ember-data-factory-guy";

FactoryGuy.define("purpose", {
  sequences: {
    id: function(num) {
      return num + 100;
    }
  },
  default: {
    id: FactoryGuy.generate("id"),
    nameEn: "organisation"
  }
});
export default {};
