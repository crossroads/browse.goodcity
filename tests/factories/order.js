import FactoryGuy from 'ember-data-factory-guy';
import './orders_package';

FactoryGuy.define('order', {
  sequences: {
    id: function(num) {
      return num;
    },
    code: function(num) {
      var code = 24400 + num;
      return "L" + code;
    }
  },
  default: {
    id:               FactoryGuy.generate('id'),
    code:             FactoryGuy.generate('code'),
    purposeDescription:       'donation',
    state:           'draft',
    createdAt:        '12/07/2016',
    updatedAt:        '12/07/2016',
    orders_packages:     FactoryGuy.hasMany('orders_package'),
  }
});
