import $ from "jquery";
import { computed } from "@ember/object";
import { alias } from "@ember/object/computed";
import { inject as service } from "@ember/service";
import Controller, { inject as controller } from "@ember/controller";
import { getOwner } from "@ember/application";
import AjaxPromise from "browse/utils/ajax-promise";
import config from "../config/environment";

export default Controller.extend({
  showCancelBookingPopUp: false,
  queryParams: ["orgId", "bookAppointment", "onlineOrder"],

  authenticate: controller(),
  messageBox: service(),
  orderService: service(),
  i18n: service(),
  organisationId: alias("model.organisation.id"),
  organisationsUserId: alias("model.organisationsUser.id"),
  user: alias("model.user"),
  position: "",
  email: "",
  bookAppointment: false,
  onlineOrder: false,
  preferredContactNumber: "",
  mobilePhone: "",
  isMobileApp: config.cordova.enabled,
  userInfoError: "",
  firstName: computed("model.user.firstName", function() {
    return $.trim(this.get("model.user.firstName"));
  }),
  lastName: computed("model.user.lastName", function() {
    return $.trim(this.get("model.user.lastName"));
  }),

  userTitle: computed("model", function() {
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

  selectedTitle: computed("userTitle", function() {
    return {
      name: this.get("userTitle.name"),
      id: this.get("userTitle.id")
    };
  }),

  titles: computed(function() {
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

  redirectToTransitionOrBrowse(bookAppointment) {
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
      this.transitionToRoute("submitted_order_selection");
    } else if (attemptedTransition) {
      this.set("attemptedTransition", null);
      attemptedTransition.retry();
    } else {
      this.transitionToRoute("browse");
    }
  },

  organisationsUserParams() {
    var organisationsUserId = this.get("organisationsUserId");
    var user = this.get("user");
    var position = organisationsUserId
      ? this.get("model.organisationsUser.position")
      : this.get("position");
    let preferredNumber =
      this.get("preferredContactNumber") || $("#preferred_contact").val();
    var title = this.get("selectedTitle.id");
    var params = {
      user_id: user.get("id"),
      organisation_id: this.get("organisationId"),
      position: position,
      preferred_contact_number: preferredNumber,
      user_attributes: {
        first_name: this.get("firstName"),
        last_name: this.get("lastName"),
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

  mobileParam() {
    const mobile = this.get("user.mobile") || this.get("mobilePhone");

    if (!mobile) {
      return;
    }

    if (mobile.startsWith("+852")) {
      return mobile;
    } else {
      return `+852${mobile}`;
    }
  },

  emailParam(user) {
    var email = user && user.get("email");
    return email && email.length ? email : this.get("email");
  },

  actions: {
    saveAccount() {
      if (!this.get("firstName") || !this.get("lastName")) {
        return false;
      }

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
          loadingView.destroy();
          this.redirectToTransitionOrBrowse(bookAppointment);
        })
        .catch(xhr => {
          loadingView.destroy();
          this.get("messageBox").alert(xhr.responseJSON.error);
        });
    },

    goToSearchOrg() {
      if (!this.get("organisationsUserId")) {
        this.transitionToRoute("search_organisation");
      }
    },

    validateUserInfo() {
      if (this.get("firstName") && this.get("lastName")) {
        this.set("userInfoError", "");
      } else {
        this.set("userInfoError", "user-info-error");
      }
    }
  }
});
