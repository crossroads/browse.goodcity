import Ember from "ember";
import pagedArray from "ember-cli-pagination/computed/paged-array";

export default Ember.Component.extend({
  categoryId: null,
  sortBy: null,

  pagedContent: pagedArray("content", { perPageBinding: "perPage" }),
  pageBinding: "pagedContent.page",
  totalPagesBinding: "pagedContent.totalPages",

  showPaginationBar: Ember.computed("pagedContent.totalPages", function() {
    return this.get("pagedContent.totalPages") > 1;
  })
});
