import FactoryGuy from 'ember-data-factory-guy';
import './order';

FactoryGuy.define('orders_purpose', {
  sequences: {
    id: (num)=> num + 100
  },
  default: {
    id:       FactoryGuy.generate('id'),
    orderId: 1,
    purposeId:   10,
    order:     FactoryGuy.belongsTo('order')
  }
});

export default {};
