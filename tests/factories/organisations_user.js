import FactoryGuy from 'ember-data-factory-guy';

FactoryGuy.define('organisations_user', {
  sequences: {
    id: function(num) {
      return num;
    },
    position: function(num) {
      return 'position' + num;
    }
  },

  default: {
    id: FactoryGuy.generate('id'),
    position: FactoryGuy.generate('position'),
    organisation:   FactoryGuy.belongsTo('organisation'),
    user: FactoryGuy.belongsTo('user')
  }
});

export default {};

