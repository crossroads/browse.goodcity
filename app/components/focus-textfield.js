import Ember from "ember";

export default Ember.TextField.extend({
  tagName: "input",
  type:    "text",
  maxlength: "25",
  attributeBindings: [ "name", "id", "value", 'placeholder'],
  cordova: Ember.inject.service(),
  store: Ember.inject.service(),
  hasRecentDesignations: true,

  triggerAutofocus: Ember.observer("value", function() {
    if (this.get('value').length === 0) {
      this.$().focus();
    }
  }),

  // hasFixedInputHeader: Ember.computed(function() {
  //   return this.get("cordova").isIOS() && Ember.$(".fixed_search_header").length > 0;
  // }),

  scrollToStart() {
    Ember.$(".fixed_search_header").addClass("absolute");
    Ember.$(".footer").addClass("absolute_footer");
    Ember.$(".search").addClass("no-padding");

    document.body.scrollTop = document.documentElement.scrollTop = 0;
  },

  focusOut(){
    if(this.get("hasFixedInputHeader")) {
      Ember.$(".fixed_search_header").removeClass("absolute");
      Ember.$(".footer").removeClass("absolute_footer");
      Ember.$(".search").removeClass("no-padding");
    }
  },

  // didInsertElement() {
  //   var routes = this.router.router.currentHandlerInfos;
  //   var currentRoute = routes.pop();
  //   var isIndexRoute = currentRoute.name === "items.index" ? true : false;
  //   if(this.get('hasRecentDesignations') && isIndexRoute) {
  //     var recentlyUsedDesignations = this.get('store').query('designation', { shallow: true, recently_used: true });
  //     recentlyUsedDesignations.forEach(record => {
  //       if(record.constructor.toString() === "stock@model:designation:") {
  //         this.store.query("orders_package", { search_by_order_id: record.get("id")
  //       });
  //       }
  //     });
  //     var recentlyUsedLocations = this.get('store').query('location', { recently_used: true });
  //     this.get('store').pushPayload(recentlyUsedDesignations);
  //     this.get('store').pushPayload(recentlyUsedLocations);
  //     this.set('hasRecentDesignations', false);
  //   }
  //   document.body.scrollTop = document.documentElement.scrollTop = 0;
  //   this.$().focus();
  //   if(this.get("hasFixedInputHeader")) {
  //     this.element.addEventListener('touchstart', this.scrollToStart);
  //   }
  // },

  willDestroyElement() {
    if(this.get("hasFixedInputHeader")) {
      this.element.addEventListener('touchstart', this.scrollToStart);
    }
  }
});
