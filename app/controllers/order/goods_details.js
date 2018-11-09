import Ember from "ember";
const { getOwner } = Ember;

export default Ember.Controller.extend({
  queryParams: ["typeId"],
  order: Ember.computed.alias("model"),
  typeId: null,
  qty: null,
  otherDetails: "",
  requestCount: 3,

  requests: Ember.computed('order.goodcity_requests.[]', function(){
  	var req = [];
  	if(this.get('order.goodcityRequests')){
  		req = this.get('order.goodcityRequests');
  	} else {
  		req.pushObject({
	  		description: '',
				quantity: '',
				otherDetails: '',
				order: this.get('order')
	  	});
  	} 
  	return req;
  }),

  newRequest(){
  	return this.get('requests').pushObject(this.store.createRecord('goodcityRequest',{
  		description: '',
			quantity: '',
			order: this.get('order')
  	}));
  },

  getRequestParams() {
    var quantity = this.get("quantity");
    var description = this.get("description");
    var itemSpecifics = this.get('otherDetails');
    var params = {
      quantity: quantity,
      description: description,
      item_specifics: itemSpecifics,
      package_type_id: this.get("typeId"),
      order_id: this.get("order.id")
    };
    return { goodcity_request: params };
  },

  actions: {
  	addRequest(){
  		this.get('requests').pushObject(this.store.createRecord('goodcityRequest',{
	  		description: '',
				quantity: '',
				otherDetails: '',
				order: this.get('order')
	  	}));
  	},

  	saveGoodsDetails(){
      var promises = [];
      this.get('order.goodcityRequests').forEach(goodcityRequest => {
        promises.push(goodcityRequest.save());
      });

      var loadingView = getOwner(this).lookup('component:loading').append();

      Ember.RSVP.all(promises).then(function(){
        loadingView.destroy();
      }).finally(() =>{
        this.transitionToRoute('order.appointment_details', this.get("order.id"));
      });
  	},
  }
});
