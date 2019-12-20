import { debounce, later } from "@ember/runloop";
import $ from "jquery";
import { computed, observer } from "@ember/object";
import { inject as service } from "@ember/service";
import { alias } from "@ember/object/computed";
import Controller from "@ember/controller";
import { getOwner } from "@ember/application";
import { translationMacro as t } from "ember-i18n";
import AjaxPromise from "browse/utils/ajax-promise";

export default Controller.extend({
  queryParams: ["changeCode", "reqId"],
  reqId: null,
  changeCode: false,
  order: alias("model"),
  filter: "",
  searchText: "",
  fetchMoreResult: true,
  searchPlaceholder: t("search.placeholder"),
  i18n: service(),

  allPackageTypes: computed("fetchMoreResult", function() {
    return this.store.peekAll("package_type");
  }),

  hasSearchText: computed("searchText", function() {
    return $.trim(this.get("searchText")).length;
  }),

  hasFilter: computed("filter", function() {
    return $.trim(this.get("filter")).length;
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
      var filter = $.trim(this.get("filter").toLowerCase());
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
    var string = $.trim(this.get("filter").toLowerCase());
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
    clearSearch(isCancelled) {
      this.set("filter", "");
      this.set("searchText", "");
      this.set("fetchMoreResult", true);
      if (!isCancelled) {
        $("#searchText").focus();
      }
    },

    cancelSearch() {
      $("#searchText").blur();
      this.send("clearSearch", true);
      this.transitionToRoute("order.goods_details", this.get("order.id"));
    },

    assignItemLabel(type) {
      let url, actionType;
      var orderId = this.get("order.id");
      var reqId = this.get("reqId");
      // var url = `/goodcity_requests/`;
      var key = "package_type_id";
      var goodcityRequestParams = {};
      goodcityRequestParams[key] = type.get("id");
      goodcityRequestParams["quantity"] = 1;
      goodcityRequestParams["order_id"] = orderId;

      if (reqId) {
        url = "/goodcity_requests/" + reqId;
        actionType = "PUT";
      } else {
        url = "/goodcity_requests";
        actionType = "POST";
      }

      var loadingView = getOwner(this)
        .lookup("component:loading")
        .append();

      new AjaxPromise(url, actionType, this.get("session.authToken"), {
        goodcity_request: goodcityRequestParams
      })
        .then(data => {
          this.send("clearSearch");
          this.get("store").pushPayload(data);
        })
        .finally(() => {
          loadingView.destroy();
        });
      this.transitionToRoute("order.goods_details", orderId);
    }
  }
});
