import Ember from "ember";
import _ from "lodash";

export default Ember.Controller.extend({
  minSearchTextLength: 2,
  filteredResults: [],
  displayResults: false,

  onSearchTextChange: Ember.observer("searchText", function() {
    if (this.get("searchText").length > this.get("minSearchTextLength")) {
      this.reloadResults();
    }
    this.set("filteredResults", []);
  }),

  reloadResults() {
    this.hideResults();
    Ember.run.debounce(this, this.showResults, 500);
  },

  hideResults() {
    Ember.run(() => {
      this.set("displayResults", false);
    });
  },

  showResults() {
    Ember.run(() => {
      this.set("displayResults", true);
    });
  },

  getSearchQuery() {
    return {
      searchText: this.get("searchText")
    };
  },

  getPaginationQuery(pageNo) {
    return {
      per_page: 25,
      page: pageNo
    };
  },

  trimQuery(query) {
    // Remove any undefined values
    return _.pickBy(query, _.identity);
  },

  actions: {
    cancelSearch() {
      Ember.$("#searchText").blur();
      this.send("clearSearch", true);
      this.transitionToRoute("app_menu_list");
    },

    selectItem(item) {
      if (item) {
        this.transitionToRoute("package", item.id, {
          queryParams: {
            categoryId: item.get("allPackageCategories.firstObject.id")
          }
        });
      }
    },

    back() {
      window.history.back();
    },

    loadMoreGoods(pageNo) {
      const params = this.trimQuery(
        _.merge({}, this.getSearchQuery(), this.getPaginationQuery(pageNo))
      );
      return this.get("store").query("package", params);
    }
  }
});
