import { computed, observer } from "@ember/object";
import { sort, alias, bool } from "@ember/object/computed";
import Controller from "@ember/controller";

export default Controller.extend({
  queryParams: ["page"],
  page: 1,
  perPage: 12,
  selectedCategoryId: null,
  sortedItems: sort("categoryObj.items", "selectedSort"),
  currentCategoryId: alias("categoryObj.id"),
  currentCategoryName: alias("categoryObj.name"),
  currentCategory: alias("categoryObj"),

  selectedSort: computed({
    get() {
      return this.get("sortOptions.firstObject.id");
    },
    set(key, value) {
      return value.id || value;
    }
  }),

  navigateToPageTop: observer("page", function() {
    window.scrollTo(0, 0);
  }),

  sortOptions: computed(function() {
    return [
      {
        name: this.get("i18n").t("category.sort.newfirst"),
        id: ["createdAt:desc"]
      },
      { name: this.get("i18n").t("category.sort.oldfirst"), id: ["createdAt"] }
    ];
  }),

  isCategorySelected: bool("selectedCategoryId.id"),

  categoryObj: computed("selectedCategoryId", "model", function() {
    this.set("page", 1);
    var selectedCategoryId = this.get("selectedCategoryId.id");
    return selectedCategoryId
      ? this.store.peekRecord("package_category", selectedCategoryId)
      : this.get("model");
  }),

  selectCategories: computed("model", function() {
    return this.get("model.childCategories").map(c => ({
      name: c.get("nameItemsCount"),
      id: c.get("id")
    }));
  })
});
