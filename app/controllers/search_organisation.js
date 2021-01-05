import Ember from "ember";
import { computed, observer } from "@ember/object";
import { debounce, run } from "@ember/runloop";
import BrowseController from "./browse";
import _ from "lodash";

export default BrowseController.extend({
  minSearchTextLength: 3,
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
    selectOrganisation(organisation) {
      this.transitionToRoute("account_details", {
        queryParams: { orgId: organisation.id }
      });
    },

    clearSearch() {
      this.set("searchText", "");
    },

    back() {
      this.transitionToRoute("account_details");
    },

    loadMoreOrganisations(pageNo) {
      const params = this.trimQuery(
        _.merge(
          {
            url: "organisations/names"
          },
          this.getSearchQuery(),
          this.getPaginationQuery(pageNo)
        )
      );
      return this.store.query("organisation", params);
    }
  }
});
