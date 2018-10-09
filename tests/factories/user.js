import FactoryGuy from 'ember-data-factory-guy';

FactoryGuy.define('user',{
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
    id:        FactoryGuy.generate('id'),
    firstName: FactoryGuy.generate('collectionFirstName'),
    lastName:  FactoryGuy.generate('collectionLastName'),
    email: "rock.programmer@hotmail.com",
    title: "Mr",
    userRoles: FactoryGuy.hasMany('user_role'),
    organisations: FactoryGuy.hasMany('organisation'),
    mobile: Math.floor(Math.random() * 8999922 + 67110000).toString()
  },
  user_without_name_and_mobile: {
    id:        FactoryGuy.generate('id'),
    firstName: "",
    lastName:  "",
    userRoles: FactoryGuy.hasMany('user_role'),
    organisations: FactoryGuy.hasMany('organisation'),
    mobile: ""
  }
});
export default {};
