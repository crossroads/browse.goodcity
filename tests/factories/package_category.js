import FactoryGuy from "ember-data-factory-guy";

FactoryGuy.define("package_category", {
  sequences: {
    id: num => num + 100,
    name: num => `Category${num}`
  },
  default: {
    id: FactoryGuy.generate("id"),
    name: FactoryGuy.generate("name"),
    parentId: FactoryGuy.generate("id"),
    packageTypeCodes: FactoryGuy.generate("name")
  },
  parent_package_category: {
    parentId: null,
    packageTypeCodes: null
  }
});

export default {};
