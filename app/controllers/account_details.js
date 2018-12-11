import Ember from "ember";
import AjaxPromise from 'browse/utils/ajax-promise';
const { getOwner } = Ember;
import config from "../config/environment";

export default Ember.Controller.extend({
  queryParams: ['orgId', 'bookAppointment'],

  authenticate:Ember.inject.controller(),
  messageBox: Ember.inject.service(),
  i18n: Ember.inject.service(),
  organisationId: Ember.computed.alias('model.organisation.id'),
  organisationsUserId: Ember.computed.alias('model.organisationsUser.id'),
  position: "",
  bookAppointment: false,
  isMobileApp: config.cordova.enabled,

  districts: Ember.computed(function(){
    return this.store.peekAll('district');
  }),

  returnSelectedField (selectedFieldName){
    return { name: this.get(`${selectedFieldName}.name`), id: this.get(`${selectedFieldName}.id`)};
  },

  userDistrict: Ember.computed('model', function(){
    let userDistrict = this.get('model.user.address.district');
    let districts = this.get('districts');
    if(userDistrict){
      let filteredUserDistrict = districts.filterBy('name', userDistrict.get('name'));
      return {id: filteredUserDistrict.get('firstObject.id'), name: filteredUserDistrict.get('firstObject.name')};
    }
    return { name: districts.get('firstObject.name'), id: districts.get('firstObject.id') };
  }),

  selectedDistrict: Ember.computed('userDistrict', function (){
    return this.returnSelectedField('userDistrict');
  }),

  userTitle: Ember.computed('model', function() {
    let userTitle = this.get('model.user.title');
    let titles = this.get('titles');

    if(userTitle) {
      let filteredUserTitle = titles.filter((title) => userTitle === title.id);
      return { name: filteredUserTitle[0].name.string, id: userTitle };
    }
    return { name: titles.get('firstObject.name').string, id: 'Mr' };
  }),

  selectedTitle: Ember.computed('userTitle', function (){
    return this.returnSelectedField('userTitle');
  }),

  titles: Ember.computed(function() {
    let translation = this.get("i18n");
    let mr = translation.t("account.user_title.mr");
    let mrs = translation.t("account.user_title.mrs");
    let miss = translation.t("account.user_title.miss");
    let ms = translation.t("account.user_title.ms");

    return [
      { name: mr, id: "Mr" },
      { name: mrs, id: "Mrs" },
      { name: miss, id: "Miss" },
      { name: ms, id: "Ms" }
    ];
  }),

  redirectToTransitionOrBrowse(bookAppointment) {
    var attemptedTransition = this.get('authenticate').get('attemptedTransition');
    if(bookAppointment){
      this.transitionToRoute("request_purpose");
    }
    else if (attemptedTransition) {
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
    var title = this.get('selectedTitle.id');
    var district = this.get('selectedDistrict.id');
    var params = {
      organisation_id: this.get('organisationId'),
      position: position,
      user_attributes: {
        first_name: user.get('firstName'),
        last_name: user.get('lastName'),
        mobile: user.get('mobile'),
        email: user.get('email'),
        title: title
      },
      user_address_attributes: {
        district_id: district
      }
    };
    if (organisationsUserId) {
      params.id = organisationsUserId;
    }

    return params;
  },

  actions: {
    saveAccount() {
      let url, actionType;
      let organisationUserId = this.get('organisationsUserId');
      if (organisationUserId) {
        url = "/organisations_users/" + organisationUserId;
        actionType = "PUT";
      } else {
        url = "/organisations_users";
        actionType = "POST";
      }
      this.send('saveOrUpdateAccount', url, actionType);
    },

    saveOrUpdateAccount(url, actionType) {
      var loadingView = getOwner(this).lookup('component:loading').append();
      var bookAppointment = this.get('bookAppointment');
      new AjaxPromise(url, actionType, this.get('session.authToken'), { organisations_user: this.organisationsUserParams()} ).then(data => {
        this.get("store").pushPayload(data);
        this.redirectToTransitionOrBrowse(bookAppointment);
      }).catch(xhr => {
        this.get("messageBox").alert(xhr.responseJSON.errors);
      })
      .finally(() =>
        loadingView.destroy()
      );
    },

    goToSearchOrg(){
      if (!this.get('organisationsUserId')) {
        this.transitionToRoute("search_organisation");
      }
    }
  }
});
