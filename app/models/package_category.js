import Ember from "ember";
import DS from 'ember-data';

var attr = DS.attr;

export default DS.Model.extend({
  parentId:         attr('number'),
  name:             attr('string'),
  packageTypeCodes: attr('string'),

  isParent: Ember.computed.equal("parentId", null),
  isChild: Ember.computed.notEmpty("parentId"),

  childCategories: function() {
    return this.store.peekAll('package_category').filterBy('parentId', parseInt(this.get("id")));
  }.property(),

  items: function(){
    var items = [];
    if(this.get('packageTypeCodes.length') > 0) {
      this.get('packageTypes').forEach(function(pkg){
        items = items.concat(pkg.get('items').toArray());
      });
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
});
