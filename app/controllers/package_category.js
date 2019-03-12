import Ember from "ember";

export default Ember.Controller.extend({
  queryParams: ["page"],
  page: 1,
  perPage: 12,
  selectedCategoryId: null,
  sortedItems: Ember.computed.sort("categoryObj.items", "selectedSort"),
  currentCategoryId: Ember.computed.alias("categoryObj.id"),

  selectedSort: Ember.computed({
    get() {
      return this.get("sortOptions.firstObject.id");
    },
    set(key, value) {
      return value.id || value;
    }
  }),

  sortOptions: Ember.computed(function() {
    return [
      {
        name: this.get("i18n").t("category.sort.newfirst"),
        id: ["createdAt:desc"]
      },
      { name: this.get("i18n").t("category.sort.oldfirst"), id: ["createdAt"] }
    ];
  }),

  categoryObj: Ember.computed("selectedCategoryId", "model", function() {
    this.set("page", 1);
    var selectedCategoryId = this.get("selectedCategoryId.id");
    return selectedCategoryId
      ? this.store.peekRecord("package_category", selectedCategoryId)
      : this.get("model");
  }),

  selectCategories: Ember.computed("model", function() {
    return this.get("model.childCategories").map(c => ({
      name: c.get("nameItemsCount"),
      id: c.get("id")
    }));
  })
});
