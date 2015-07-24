import Ember from "ember";
import DS from 'ember-data';

var attr = DS.attr;

export default DS.Model.extend({
  parentId:         attr('number'),
  name:             attr('string'),
  packageTypeCodes: attr('string'),

  isParent: Ember.computed.equal("parentId", null),
  isChild:  Ember.computed.notEmpty("parentId"),

  selectValue: Ember.computed.alias('id'),
  selectName:  Ember.computed.alias('nameItemsCount'),

  parentCategory: function(){
    return this.get('parentId') ? this.store.peekRecord('package_category', this.get('parentId')) : null;
  }.property('parentId'),

  nameItemsCount: function(){
    return this.get("name") + " (" + this.get("items.length") + ")";
  }.property('name', 'items.[]'),

  childCategories: function() {
    return this.get('allChildCategories').rejectBy('items.length', 0);
  }.property('allChildCategories'),

  allChildCategories: function() {
    return this.get('_packageCategories').filterBy('parentId', parseInt(this.get("id")));
  }.property('_packageCategories.[]'),

  _packageCategories: function() {
    return this.store.peekAll("package_category");
  }.property(),

  items: function(){
    var items = [];
    if(this.get('isParent')) {
      return this.get('allItems');
    } else {
      if(this.get('packageTypeCodes.length') > 0) {
        this.get('packageTypes').forEach(function(pkg){
          items = items.concat(pkg.get('items').toArray());
        });
      }
    }
    return items;
  }.property('packageTypeCodes'),

  _packageTypes: function() {
    return this.store.peekAll("package_type");
  }.property(),

  packageTypes: function(){
    if (this.get('packageTypeCodes.length') > 0) {
      var list = this.get('packageTypeCodes').split(',');
      return this.get("_packageTypes").filter(p => list.indexOf(p.get("code")) > -1);
    }
    return [];
  }.property('packageTypeCodes', "_packageTypes.[]"),

  allItems: function(){
    var items = [];
    if(this.get('isParent')) {
      this.get('childCategories').forEach(function(category){
        items = items.concat((category.get('items') || []).toArray());
      });
    }
    return items;
  }.property('childCategories', 'items'),

  imageUrl: function(){
    if(this.get('isParent')) {
      var images = {
        "Furniture": "1436965082/browse/browse_image_2.png",
        "Electrical": "1436965083/browse/browse_image_3.png",
        "Household": "1436965082/browse/browse_image_4.png",
        "Small goods & bulk items": "1436965083/browse/browse_image_5.png",
        "Recreation": "1436965083/browse/browse_image_6.png"
      };
      var id = images[this.get("name")];
      var version = id.split("/")[0];
      var filename = id.substring(id.indexOf("/") + 1);
      return Ember.$.cloudinary.url(filename, {
        version: version,
        height: 100,
        width: 100,
        crop: 'fill',
        flags: "progressive",
        id: id,
        secure: true,
        protocol: 'https:',
        radius: 'max'
      });
    }
  }.property()
});
