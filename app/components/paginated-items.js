import { computed } from "@ember/object";
import Component from "@ember/component";
import pagedArray from "ember-cli-pagination/computed/paged-array";

export default Component.extend({
  categoryId: null,
  sortBy: null,

  pagedContent: pagedArray("content", { perPageBinding: "perPage" }),
  pageBinding: "pagedContent.page",
  totalPagesBinding: "pagedContent.totalPages",

  showPaginationBar: computed("pagedContent.totalPages", function() {
    return this.get("pagedContent.totalPages") > 1;
  })
});
