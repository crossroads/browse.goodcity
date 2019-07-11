import Ember from "ember";
import AjaxPromise from "browse/utils/ajax-promise";
const { getOwner } = Ember;
import config from "../config/environment";
import { task } from "ember-concurrency";

export default Ember.Controller.extend({
  showCancelBookingPopUp: false,
  queryParams: ["orgId", "bookAppointment", "onlineOrder"],

  authenticate: Ember.inject.controller(),
  messageBox: Ember.inject.service(),
  orderService: Ember.inject.service(),
  i18n: Ember.inject.service(),
  organisationId: Ember.computed.alias("model.organisation.id"),
  organisationsUserId: Ember.computed.alias("model.organisationsUser.id"),
  user: Ember.computed.alias("model.user"),
  position: "",
  email: "",
  bookAppointment: false,
  onlineOrder: false,
  preferredContactNumber: "",
  mobilePhone: "",
  isMobileApp: config.cordova.enabled,

  userTitle: Ember.computed("model", function() {
    let userTitle = this.get("model.user.title");
    let titles = this.get("titles");

    if (userTitle) {
      let filteredUserTitle = titles.filter(title => userTitle === title.id);
      return {
        name: filteredUserTitle[0].name.string,
        id: userTitle
      };
    }
    return {
      name: titles.get("firstObject.name").string,
      id: "Mr"
    };
  }),

  selectedTitle: Ember.computed("userTitle", function() {
    return {
      name: this.get("userTitle.name"),
      id: this.get("userTitle.id")
    };
  }),

  titles: Ember.computed(function() {
    let translation = this.get("i18n");
    let mr = translation.t("account.user_title.mr");
    let mrs = translation.t("account.user_title.mrs");
    let miss = translation.t("account.user_title.miss");
    let ms = translation.t("account.user_title.ms");

    return [
      {
        name: mr,
        id: "Mr"
      },
      {
        name: mrs,
        id: "Mrs"
      },
      {
        name: miss,
        id: "Miss"
      },
      {
        name: ms,
        id: "Ms"
      }
    ];
  }),

  redirectToTransitionOrBrowse: task(function*(bookAppointment) {
    let onlineOrder = this.get("onlineOrder");
    var attemptedTransition = this.get("authenticate").get(
      "attemptedTransition"
    );
    if (bookAppointment) {
      this.transitionToRoute("request_purpose", {
        queryParams: {
          bookAppointment: true,
          prevPath: "account_details"
        }
      });
    } else if (onlineOrder) {
      const hasCompletedOrMultipleDraftOrder = yield this.get(
        "orderService"
      ).hasCompletedOrMultipleDraftOrder();
      if (hasCompletedOrMultipleDraftOrder) {
        this.transitionToRoute("submitted_orders");
      } else {
        let lastDraftOrder = yield this.get("orderService").getLastDraft({
          appointment: false
        });
        const orderId =
          lastDraftOrder && lastDraftOrder.length
            ? lastDraftOrder.get("id")
            : null;
        this.transitionToRoute("request_purpose", {
          queryParams: {
            onlineOrder: true,
            bookAppointment: false,
            orderId: orderId
          }
        });
      }
    } else if (attemptedTransition) {
      this.set("attemptedTransition", null);
      attemptedTransition.retry();
    } else {
      this.transitionToRoute("browse");
    }
  }),

  organisationsUserParams() {
    var organisationsUserId = this.get("organisationsUserId");
    var user = this.get("user");
    var position = organisationsUserId
      ? this.get("model.organisationsUser.position")
      : this.get("position");
    let preferredNumber =
      this.get("preferredContactNumber") || Ember.$("#preferred_contact").val();
    var title = this.get("selectedTitle.id");
    var params = {
      organisation_id: this.get("organisationId"),
      position: position,
      preferred_contact_number: preferredNumber,
      user_attributes: {
        first_name: user.get("firstName"),
        last_name: user.get("lastName"),
        mobile: this.mobileParam(user),
        email: this.emailParam(user),
        title: title
      }
    };
    if (organisationsUserId) {
      params.id = organisationsUserId;
    }

    return params;
  },

  mobileParam(user) {
    let mobile = user && user.get("mobile");
    let mobilePhone = this.get("mobilePhone");
    if (mobile && mobile.length) {
      return mobile;
    } else if (mobilePhone.length) {
      return "+852" + mobilePhone;
    }
  },

  emailParam(user) {
    var email = user && user.get("email");
    return email && email.length ? email : this.get("email");
  },

  actions: {
    saveAccount() {
      let url, actionType;
      let organisationUserId = this.get("organisationsUserId");
      if (organisationUserId) {
        url = "/organisations_users/" + organisationUserId;
        actionType = "PUT";
      } else {
        url = "/organisations_users";
        actionType = "POST";
      }
      this.send("saveOrUpdateAccount", url, actionType);
    },

    saveOrUpdateAccount(url, actionType) {
      var loadingView = getOwner(this)
        .lookup("component:loading")
        .append();
      var bookAppointment = this.get("bookAppointment");
      new AjaxPromise(url, actionType, this.get("session.authToken"), {
        organisations_user: this.organisationsUserParams()
      })
        .then(data => {
          this.get("store").pushPayload(data);
          if (
            !this.get("session.currentUser").hasRole("Charity") &&
            data.users.length &&
            data.users[0]["user_roles_ids"]
          ) {
            data.users[0]["user_roles_ids"].forEach(id => {
              this.store.findRecord("user_role", id);
            });
          }
          this.get("redirectToTransitionOrBrowse").perform(bookAppointment);
        })
        .catch(xhr => {
          this.get("messageBox").alert(xhr.responseJSON.errors);
        })
        .finally(() => loadingView.destroy());
    },

    goToSearchOrg() {
      if (!this.get("organisationsUserId")) {
        this.transitionToRoute("search_organisation");
      }
    }
  }
});
