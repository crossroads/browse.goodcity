import Ember from "ember";

export default Ember.Controller.extend({
  queryParams: ["page"],
  page: 1,
  perPage: 12,
  selectedCategoryId: null,
  sortedItems: Ember.computed.sort("categoryObj.items", "selectedSort"),
  currentCategoryId: Ember.computed.alias("categoryObj.id"),
  currentCategoryName: Ember.computed.alias("categoryObj.name"),
  currentCategory: Ember.computed.alias("categoryObj"),

  selectedSort: Ember.computed({
    get() {
      return this.get("sortOptions.firstObject.id");
    },
    set(key, value) {
      return value.id || value;
    }
  }),

  navigateToPageTop: Ember.observer("page", function() {
    window.scrollTo(0, 0);
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

  isCategorySelected: Ember.computed("selectedCategoryId", function() {
    return !!this.get("selectedCategoryId.id");
  }),

  categoryObj: Ember.computed("selectedCategoryId", "model", function() {
    this.set("page", 1);
    var selectedCategoryId = this.get("selectedCategoryId.id");
    if (selectedCategoryId) {
      return this.store.peekRecord("package_category", selectedCategoryId);
    } else {
      if (Ember.$("#category_select").length) {
        Ember.$("#category_select")[0].value = "";
      }
      return this.get("model");
    }
  }),

  selectCategories: Ember.computed("model", function() {
    return this.get("model.childCategories").map(c => ({
      name: c.get("nameItemsCount"),
      id: c.get("id")
    }));
  })
});
