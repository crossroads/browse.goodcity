import FactoryGuy from 'ember-data-factory-guy';

FactoryGuy.define('user', {
  sequences: {
    id: function(num) {
      return num + 100;
    },
    collectionFirstName: function(num) {
      return 'Daniel' + num;
    },
    collectionLastName: function(num) {
      return 'Stepp' + num;
    }
  },
  default: {
    firstName: FactoryGuy.generate('collectionFirstName'),
    lastName: FactoryGuy.generate('collectionLastName')
  }
});
export default {};
