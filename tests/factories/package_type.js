import FactoryGuy from 'ember-data-factory-guy';
import './item';

FactoryGuy.define('package_type', {
  sequences: {
    id: function(num) {
      return num + 100;
    },
    name: function(num) {
      return 'Category' + num;
    },
    code: function(num) {
      return "code" + num;
    }
  },
  default: {
    id:   FactoryGuy.generate('id'),
    name: FactoryGuy.generate("name"),
    code: FactoryGuy.generate("code")
  },

  package_type_with_items: {
    items: function(){ return FactoryGuy.buildList('item', 2, { state: "accepted" }); }
  }
});

export default {};
