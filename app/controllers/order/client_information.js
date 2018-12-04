import Ember from "ember";
import config from '../../config/environment';
import AjaxPromise from 'browse/utils/ajax-promise';
const { getOwner } = Ember;

export default Ember.Controller.extend({
  firstName: null,
  lastName: null,
  mobilePhone: null,
  selectedId: null,
  identityNumber: null,
  order: Ember.computed.alias("model.order"),
  beneficiary: Ember.computed.alias("model.beneficiary"),

  isHkIdSelected: Ember.computed.equal("selectedId", "hkId"),

  mobile: Ember.computed('mobilePhone', function(){
    return config.APP.HK_COUNTRY_CODE + this.get('mobilePhone');
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
    return { name: this.get('userTitle.name'), id: this.get('userTitle.id')};
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

  beneficiaryParams(){
    var beneficieryParams = {
      first_name: this.get('firstName'),
      last_name: this.get('lastName'),
      identity_number: this.get('identityNumber'),
      phone_number: this.get('mobile'),
      order_id: this.get('order.id'),
      identity_type_id: this.identityTypeId(),
      title: this.get('selectedTitle.id')
    };
    return beneficieryParams;
  },

  identityTypeId(){
    return this.get('selectedId') === 'hkId' ? 1 : 2;
  },

  actions: {
    saveClientDetails(){
      var orderId = this.get('order.id');
      var beneficiaryId = this.get('beneficiary.id');

      var url, actionType;

      if (beneficiaryId) {
        url = "/beneficiaries/" + beneficiaryId;
        actionType = "PUT";
      } else {
        url = "/beneficiaries";
        actionType = "POST";
      }

      var loadingView = getOwner(this).lookup('component:loading').append();

      new AjaxPromise(url, actionType, this.get('session.authToken'), { beneficiary: this.beneficiaryParams(), order_id: orderId })
        .then(data => {
          this.get("store").pushPayload(data);
          loadingView.destroy();
          this.transitionToRoute('order.goods_details', orderId, { queryParams: { fromClientInformation: true }});
        });
    }
  }
});
