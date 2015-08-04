import Ember from 'ember';

export default Ember.Controller.extend({

  queryParams:    ['categoryId', 'sortBy'],
  categoryId:     null,
  sortBy:         null,
  noNextItem:     Ember.computed.empty('nextItem'),
  noPreviousItem: Ember.computed.empty('previousItem'),
  hideThumbnails: Ember.computed.gt('model.sortedImages.length', 1),
  smallScreenPreviewUrl: Ember.computed.alias('model.displayImage.smallScreenPreviewImageUrl'),

  categoryObj: function(){
    return this.store.peekRecord('package_category', this.get("categoryId"));
  }.property('categoryId'),

  selectedSort: function() {
    return [this.get("sortBy")];
  }.property("sortBy"),

  sortedItems: Ember.computed.sort("categoryObj.items", "selectedSort"),

  nextItem: function(){
    var currentItem = this.get('model');
    var items = this.get("sortedItems").toArray();
    return items[items.indexOf(currentItem) + 1];
  }.property('model', 'sortedItems'),

  previousItem: function(){
    var currentItem = this.get('model');
    var items = this.get("sortedItems").toArray();
    return items[items.indexOf(currentItem) - 1];
  }.property('model', 'sortedItems'),

  previewUrl: Ember.computed("model.previewImageUrl", "model", {
    get(key) {
      return this.get("model.previewImageUrl");
    },
    set(key, value) {
      return value;
    }
  }),

  actions: {
    showPreview: function(image){
      this.set('previewUrl', image.get("previewImageUrl"));
    }
  }
});
