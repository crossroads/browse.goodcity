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
  order: Ember.computed.alias("model"),

  isHkIdSelected: Ember.computed.equal("selectedId", "hkId"),

  mobile: Ember.computed('mobilePhone', function(){
    return config.APP.HK_COUNTRY_CODE + this.get('mobilePhone');
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

  actions: {
    saveClientDetails(){
      var identityTypeId = null;
      var orderId = this.get('order.id');
      if(this.get('selectedId') === 'hkId'){
        identityTypeId = 1;
      } else if(this.get('selectedId') === 'abcl'){
        identityTypeId = 2;
      }

      var beneficieryParams = {
        first_name: this.get('firstName'),
        last_name: this.get('lastName'),
        identity_number: this.get('identityNumber'),
        phone_number: this.get('mobile'),
        order_id: orderId,
        identity_type_id: identityTypeId,
      };    

      var loadingView = getOwner(this).lookup('component:loading').append();

      new AjaxPromise("/beneficiaries", "POST", this.get('session.authToken'), { beneficiary: beneficieryParams, order_id: orderId })
        .then(data => {
          this.get("store").pushPayload(data);
          console.log('client info controller');
          loadingView.destroy();
          this.transitionToRoute('order.goods_details', orderId);
        });
    }
  }
});
