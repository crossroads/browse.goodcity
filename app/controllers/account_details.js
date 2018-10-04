import Ember from "ember";
import AjaxPromise from 'browse/utils/ajax-promise';
const { getOwner } = Ember;

export default Ember.Controller.extend({
  queryParams: ['orgId'],

  authenticate:Ember.inject.controller(),
  messageBox: Ember.inject.service(),
  organisationId: Ember.computed.alias('model.organisation.id'),
  organisationsUserId: Ember.computed.alias('model.organisationsUser.id'),
  position: "",

  userTitle: Ember.computed('model', function() {
    let userTitle = this.get('model.user.title');
    return userTitle ? userTitle : "Mr";
  }),

  selectedTitle: Ember.computed('userTitle', function (){
    return{ name: this.get('userTitle'), id: this.get('userTitle')};
  }),

  titles: Ember.computed(function() {
    return [
      { name: "Mr", id: "Mr" },
      { name: "Mrs", id: "Mrs" },
      { name: "Miss", id: "Miss" },
      { name: "Ms", id: "Ms" }
    ];
  }),

  redirectToTransitionOrBrowse() {
    var attemptedTransition = this.get('authenticate').get('attemptedTransition');
    if (attemptedTransition) {
      this.set('attemptedTransition', null);
      attemptedTransition.retry();
    } else {
      this.transitionToRoute("browse");
    }
  },

  organisationsUserParams() {
    var organisationsUserId = this.get('organisationsUserId');
    var user = this.get('model.user');
    var position = organisationsUserId ? this.get('model.organisationsUser.position') : this.get('position');
    var params = {
      organisation_id: this.get('organisationId'),
      position: position,
      user_attributes: {
        first_name: user.get('firstName'),
        last_name: user.get('lastName'),
        mobile: user.get('mobile'),
        email: user.get('email'),
        title: this.get('selectedTitle.name')
      }
    };
    if (organisationsUserId) {
      params.id = organisationsUserId;
    }

    return params;
  },

  saveOrUpdateAccount(url, actionType) {
    var loadingView = getOwner(this).lookup('component:loading').append();

    new AjaxPromise(url, actionType, this.get('session.authToken'), { organisations_user: this.organisationsUserParams()} ).then(data => {
      this.get("store").pushPayload(data);
      this.redirectToTransitionOrBrowse();
    }).catch(xhr => {
      this.get("messageBox").alert(xhr.responseJSON.errors);
    })
    .finally(() =>
      loadingView.destroy()
    );
  },

  actions: {
    saveAccount() {
      let url, actionType;
      let organisationUserId = this.get('organisationsUserId');
      if (organisationUserId) {
        url = "/organisations_users/"+organisationUserId;
        actionType = "PUT";
        this.saveOrUpdateAccount(url, actionType);
      } else {
        url = "/organisations_users";
        actionType = "POST";
        this.saveOrUpdateAccount(url, actionType);
      }
    },

    goToSearchOrg(){
      this.transitionToRoute("search_organisation");
    }
  }
});
