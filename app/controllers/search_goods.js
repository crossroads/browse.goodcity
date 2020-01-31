import { debounce, run } from "@ember/runloop";
import $ from "jquery";
import { computed, observer } from "@ember/object";
import BrowseController from "./browse";
import _ from "lodash";

export default BrowseController.extend({
  minSearchTextLength: 2,
  displayResults: false,
  hasSearchText: computed("searchText", function() {
    return $.trim(this.get("searchText")).length;
  }),

  onSearchTextChange: observer("searchText", function() {
    if (this.get("searchText").length > this.get("minSearchTextLength")) {
      return this.reloadResults();
    }
    this.set("displayResults", false);
  }),

  reloadResults() {
    this.hideResults();
    debounce(this, this.showResults, 500);
  },

  hideResults() {
    run(() => {
      this.set("displayResults", false);
    });
  },

  showResults() {
    run(() => {
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
    clearSearch(isCancelled) {
      this.set("searchText", "");
      if (!isCancelled) {
        $("#searchText").focus();
      }
    },

    cancelSearch() {
      $("#searchText").blur();
      this.send("clearSearch", true);
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
      this.transitionToRoute("browse");
    },

    loadMoreGoods(pageNo) {
      const params = this.trimQuery(
        _.merge({}, this.getSearchQuery(), this.getPaginationQuery(pageNo))
      );
      if (this.get("searchText").length > this.get("minSearchTextLength")) {
        return this.store.query("package", params);
      }
      this.hideResults();
    }
  }
});
