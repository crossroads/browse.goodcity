import FactoryGuy from "ember-data-factory-guy";
import "./package_type";
import "./package";

FactoryGuy.define("package_set", {
  sequences: {
    id: num => num + 100
  },
  default: {
    id: FactoryGuy.generate("id"),
    packageType: FactoryGuy.belongsTo("package_type"),
    packages: FactoryGuy.hasMany("package", 2, { state: "received" })
  }
});

export default {};
