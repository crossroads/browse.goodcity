import Ember from "ember";
import searchModule from "./search_module";

export default searchModule.extend({
  minSearchTextLength: 3,

  onSearchTextChange: Ember.observer("searchText", function(){
    if(this.get('searchText').length){
      Ember.run.debounce(this, this.applyFilter, 500);
    } else {
      this.set("filteredResults", []);
    }
  }),

  applyFilter() {
    var searchText = this.get("searchText");
    if (searchText.length > this.get("minSearchTextLength")) {
      this.set("isLoading", true);
      this.set("hasNoResults", false);
      if(this.get("unloadAll")) { this.get("store").unloadAll(); }

      this.infinityModel("gcOrganisation",
        { startingPage: 1, perPage: 25, modelPath: 'filteredResults'},
        { searchText: "searchText"}).then(data => {
          if(this.get("searchText") === data.meta.search) {
            this.set("filteredResults", data);
            this.store.pushPayload(data);
            this.set("hasNoResults", data.get("length") === 0);
          }
        }).finally(() => this.set("isLoading", false));
    }
    this.set("filteredResults", []);
  },

  actions: {
    cancelSearch() {
      Ember.$("#searchText").blur();
      this.send("clearSearch", true);
      this.transitionToRoute("app_menu_list");
    },

    selectOrganisation(organisation) {
      this.transitionToRoute('account_details',{ queryParams: { orgId: organisation.id }});
    }
  }
});
