import FactoryGuy from "ember-data-factory-guy";
import "./item";
import "./package_type";
import "./orders_package";

FactoryGuy.define("package", {
  sequences: {
    id: num => num + 100
  },
  default: {
    id: FactoryGuy.generate("id"),
    length: 10,
    width: 10,
    height: 10,
    inventoryNumber: "E00001",
    item: FactoryGuy.belongsTo("item"),
    packageType: FactoryGuy.belongsTo("package_type"),
    notes: "example",
    state: "expected",
    allowWebPublish: true,
    ordersPackages: FactoryGuy.hasMany("orders_package"),
    availableQuantity: 1,
    onHandQuantity: 1,
    designatedQuantity: 0,
    dispatchedQuantity: 0
  }
});

export default {};
