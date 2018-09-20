import Ember from "ember";
import InfinityRoute from "ember-infinity/mixins/route";

export default Ember.Controller.extend(InfinityRoute, {

  queryParams: ["showQuantityItems"],
  showQuantityItems: false,

  getCurrentUser: Ember.computed(function(){
    var store = this.get('store');
    var currentUser = store.peekAll('user_profile').get('firstObject') || null;
    return currentUser;
  }).volatile(),

  sanitizeString(str){
    str = str.replace(/[^a-z0-9áéíóúñü \.,_-]/gim,"");
    return str.trim();
  },

  searchText: Ember.computed('searchInput',{
    get() {
      return this.get('searchInput') || "";
    },

    set(key, value) {
      return this.sanitizeString(value);
    }
  }),

  i18n: Ember.inject.service(),
  store: Ember.inject.service(),
  isLoading: false,
  hasNoResults: false,
  itemSetId: null,
  unloadAll: false,
  minSearchTextLength: 0,
  searchInput: null,
  toDesignateItem: null,

  hasSearchText: Ember.computed("searchText", function() {
    return !!this.get("searchText");
  }),

  onSearchTextChange: Ember.observer("searchText", function() {
    // wait before applying the filter
    if (this.get("searchText").length > this.get("minSearchTextLength")) {
      this.set("itemSetId", null);
      Ember.run.debounce(this, this.applyFilter, 500);
    } else {
      this.set("filteredResults", []);
    }
  }),

  applyFilter() {
    var searchText = this.get("searchText");
    if (searchText.length > 0) {
      this.set("isLoading", true);
      this.set("hasNoResults", false);
      if(this.get("unloadAll")) { this.get("store").unloadAll(); }

      this.infinityModel(this.get("searchModelName"),
        { perPage: 25, startingPage: 1, modelPath: 'filteredResults',stockRequest: true },
        { searchText: "searchText", itemId: "itemSetId", toDesignateItem: "toDesignateItem", showQuantityItems: "showQuantityItems" })
        .then(data => {
          data.forEach(record => {
            if(record.constructor.toString() === "stock@model:designation:") {
              this.store.query("orders_package", { search_by_order_id: record.get("id") });
            }
          });
          if(this.get("searchText") === data.meta.search) {
            this.set("filteredResults", data);
            this.set("hasNoResults", data.get("length") === 0);
          }
        })
        .finally(() => this.set("isLoading", false));
    }
    this.set("filteredResults", []);
  },

  afterInfinityModel(records) {
    var searchText = this.get("searchText");
    if (searchText.length === 0 || searchText !== records.meta.search) {
      records.replaceContent(0, 25, []);
    }
  },

  actions: {
    clearSearch() {
      this.set("searchText", "");
    }
  }
});
