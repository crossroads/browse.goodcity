import { debounce, later } from "@ember/runloop";
import $ from "jquery";
import { computed, observer } from "@ember/object";
import { inject as service } from "@ember/service";
import { alias } from "@ember/object/computed";
import Component from "@ember/component";
import { translationMacro as t } from "ember-i18n";
import _ from "lodash";

export default Component.extend({
  queryParams: ["changeCode", "reqId"],
  reqId: null,
  changeCode: false,
  order: alias("model"),
  filter: "",
  searchText: "",
  fetchMoreResult: true,
  searchPlaceholder: t("search.placeholder"),
  i18n: service(),
  store: service(),
  packageTypeService: service(),

  allPackageTypes: computed("fetchMoreResult", function() {
    return this.get("store").peekAll("package_type");
  }),

  hasSearchText: computed("searchText", function() {
    return this.get("searchText").trim().length;
  }),

  hasFilter: computed("filter", function() {
    return this.get("filter").trim().length;
  }),

  onSearchTextChange: observer("searchText", function() {
    // wait before applying the filter
    debounce(this, this.applyFilter, 500);
  }),

  applyFilter: function() {
    this.set("filter", this.get("searchText"));
    this.set("fetchMoreResult", true);
  },

  filteredResults: computed(
    "filter",
    "fetchMoreResult",
    "allPackageTypes.[]",
    function() {
      var filter = this.get("filter")
        .toLowerCase()
        .trim();
      var types = [];
      var matchFilter = value =>
        (value || "").toLowerCase().indexOf(filter) !== -1;

      if (filter.length > 0) {
        this.get("allPackageTypes").forEach(function(type) {
          if (
            matchFilter(type.get("name")) ||
            matchFilter(type.get("otherTerms"))
          ) {
            types.push(type);
          }
        });
        later(this, this.highlight);
      } else {
        types = types.concat(this.get("allPackageTypes").toArray());
        this.clearHiglight();
      }

      return types
        .filterBy("allowRequests")
        .sortBy("name")
        .uniq();
    }
  ),

  highlight() {
    var string = this.get("filter")
      .toLowerCase()
      .trim();
    this.clearHiglight();
    $(".codes_results li div").each(function() {
      var text = $(this).text();
      if (text.toLowerCase().indexOf(string.toLowerCase()) > -1) {
        var matchStart = text
          .toLowerCase()
          .indexOf("" + string.toLowerCase() + "");
        var matchEnd = matchStart + string.length - 1;
        var beforeMatch = text.slice(0, matchStart);
        var matchText = text.slice(matchStart, matchEnd + 1);
        var afterMatch = text.slice(matchEnd + 1);
        $(this).html(beforeMatch + "<em>" + matchText + "</em>" + afterMatch);
      }
    });
  },

  clearHiglight() {
    $("em").replaceWith(function() {
      return this.innerHTML;
    });
  },

  actions: {
    clearSearch() {
      this.set("filter", "");
      this.set("searchText", "");
      this.set("fetchMoreResult", true);
    },

    cancelSearch() {
      this.get("packageTypeService").setOverlayVisibility(false);
    },

    assignItemLabel(type) {
      if (!type) {
        return;
      }
      const onSelect = this.getWithDefault("onSelect", _.noop);
      onSelect(type);
    }
  }
});
