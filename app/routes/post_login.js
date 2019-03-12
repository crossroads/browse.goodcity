import Ember from "ember";
import preloadDataMixin from "../mixins/preload_data";
import AjaxPromise from "browse/utils/ajax-promise";

export default Ember.Route.extend(preloadDataMixin, {
  cart: Ember.inject.service(),
  messageBox: Ember.inject.service(),
  session: Ember.inject.service(),
  isBookAppointment: false,

  beforeModel(params) {
    this.set("isBookAppointment", params.queryParams.bookAppointment);
  },

  model() {
    return this.preloadData().then(res => {
      let draftOrder = this.get("session.draftOrder");
      if (!draftOrder) {
        return res;
      }

      return Ember.RSVP.all(
        draftOrder.get("ordersPackages").map(op => {
          return this.loadIfAbsent("package", op.get("packageId"));
        })
      ).then(() => res);
    });
  },

  loadIfAbsent(modelName, id) {
    let cachedRecord = this.store.peekRecord(modelName, id);
    if (cachedRecord) {
      return Ember.RSVP.resolve(cachedRecord);
    }
    return this.store.findRecord(modelName, id);
  },

  afterModel() {
    var ordersPackages = [];
    // Merging Offline cart items with Order in draft state
    var draftOrder = this.get("session.draftOrder");
    if (draftOrder) {
      ordersPackages = draftOrder.get("ordersPackages");
    }
    if (draftOrder && ordersPackages.length) {
      ordersPackages.forEach(ordersPackage => {
        this.get("cart").pushItem(ordersPackage.get("package"));
      });

      let packageIds = this.get("cart.packageIds");
      if (!packageIds.length) {
        return this.redirectToTransitionOrDetails();
      }

      var orderParams = {
        cart_package_ids: packageIds
      };

      new AjaxPromise(
        `/orders/${draftOrder.id}`,
        "PUT",
        this.get("session.authToken"),
        { order: orderParams }
      )
        .then(data => {
          this.get("store").pushPayload(data);
          this.redirectToTransitionOrDetails();
        })
        .catch(xhr => {
          this.get("messageBox").alert(xhr.responseJSON.errors);
        });
    } else {
      this.redirectToTransitionOrDetails();
    }
  },

  redirectToTransitionOrDetails() {
    if (this.isDetailsComplete()) {
      var attemptedTransition = this.controllerFor("login").get(
        "attemptedTransition"
      );
      var isBookAppointment = this.get("isBookAppointment");
      if (attemptedTransition) {
        attemptedTransition.retry();
        this.controllerFor("login").set("attemptedTransition", null);
      } else if (isBookAppointment === "true") {
        this.transitionTo("request_purpose");
      } else {
        this.transitionTo("browse");
      }
    } else {
      this.transitionTo("account_details");
    }
  },

  isDetailsComplete() {
    const user = this.get("session.currentUser");
    if (!user) {
      return false;
    }

    const organisationsUser = user.get("organisationsUsers.firstObject");
    const organisation =
      organisationsUser && organisationsUser.get("organisation");
    const userInfoComplete =
      user.get("isInfoComplete") && user.hasRole("Charity");
    const organisationUserComplete =
      organisationsUser && organisationsUser.get("isInfoComplete");

    return userInfoComplete && organisation && organisationUserComplete;
  }
});
