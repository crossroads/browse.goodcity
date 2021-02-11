import Controller from "@ember/controller";
import { computed } from "@ember/object";
import _ from "lodash";

export default Controller.extend({
  showSearch: false,

  selectedSort: computed({
    get() {
      return this.get("sortOptions.firstObject.id");
    },
    set(key, value) {
      return value.id || value;
    }
  }),

  offers: computed("model", "selectedSort", function() {
    const sortedOffer = _.sortBy(this.get("model"), [
      function(offer) {
        return offer.submitted_at;
      }
    ]);
    return this.get("selectedSort") == "asc"
      ? sortedOffer
      : sortedOffer.reverse();
  }),

  sortOptions: computed(function() {
    return [
      {
        name: this.get("i18n").t("category.sort.newfirst"),
        id: "desc"
      },
      { name: this.get("i18n").t("category.sort.oldfirst"), id: "asc" }
    ];
  })
});
