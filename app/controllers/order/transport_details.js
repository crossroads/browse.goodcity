import Ember from 'ember';
import AjaxPromise from './../../utils/ajax-promise';
import applicationController from './../application';
const { getOwner } = Ember;

export default applicationController.extend({

  logger: Ember.inject.service(),
  order: Ember.computed.alias("model.order"),
  selectedDate: null,
  scheduledDate: null,
  todaysDate: null,
  selectedTime: null,
  selectedId: null,
  userName: Ember.computed.alias("user.fullName"),
  mobilePhone: Ember.computed.alias("user.mobileWithoutCountryCode"),
  isSelfSelected: Ember.computed.equal("selectedId", "self"),

  displayUserPrompt: false,
  speakEnglish: false,
  borrowTrolley: false,
  porterage: false,
  longerGoods: false,
  longGoodSelection: "half",
  messageBox: Ember.inject.service(),
  i18n: Ember.inject.service(),
  changeTime: null,
  changeDate: null,

  changeDateValue: Ember.observer("changeDate", function() {
    Ember.run.later(() => {
      this.set("selectedDate", this.get("changeDate"));
    }, 750);
  }),

  updateTimeValue: Ember.observer("changeTime", function() {
    Ember.run.later(() => {
      var time = this.get("changeTime");
      if(time === "1") {
        this.set("selectedTime", { id: "1", name: "10:30AM-1PM" });
      } else if(time === "2") {
        this.set("selectedTime", { id: "2", name: "2PM-4PM" });
      }
      Ember.$('select:eq(0)').val(time);
    }, 750);
  }),

  timeValidationTrigger: Ember.observer('selectedTime', function() {
    if(!this.get("selectedTime.name")) {
      Ember.$('.time_selector').addClass('form__control--error');
      return false;
    } else {
      Ember.$('.time_selector').removeClass('form__control--error');
    }
  }),

  gogovanOptions: Ember.computed(function(){
    var allOptions = this.store.peekAll('gogovan_transport');
    return allOptions.rejectBy('disabled', true).sortBy('id');
  }),

  selectedGogovanOption: Ember.computed('gogovanOptions', function(){
    return this.get('gogovanOptions.firstObject.id');
  }),

  isSelectedVan: Ember.computed("selectedGogovanOption", function(){
    return this.get("selectedGogovanOption") === "1";
  }),

  availableDates: Ember.computed({
    get: function() {
      new AjaxPromise("/available_dates", "GET", this.get('session.authToken'), {schedule_days: 40})
        .then(data => this.set("availableDates", data));
    },
    set: function(key, value) {
      return value;
    }
  }),

  ggvAvailableDates: Ember.computed('ggvAvailableDates.[]', {
    get: function() {
      new AjaxPromise("/available_dates", "GET", this.get('session.authToken'), {schedule_days: 120})
        .then(data => this.set("ggvAvailableDates", data));
    },
    set: function(key, value) {
      return value;
    }
  }),

  timeSlots: Ember.computed(function(){
    return [
      {id: "1", name: "10:30AM-1PM"},
      {id: "2", name: "2PM-4PM"}
    ];
  }),

  user: Ember.computed.alias('session.currentUser'),
  selectedTerritory: null,
  selectedDistrict: null,

  initSelectedTerritories: Ember.on('init', function() {
    if(this.get("selectedDistrict") === null) {
      this.set("selectedTerritory", this.get("user.address.district.territory"));
      this.set("selectedDistrict", this.get("user.address.district"));
    }
  }),

  territories: Ember.computed(function(){
    return this.store.peekAll('territory');
  }),

  districtsByTerritory: Ember.computed('selectedTerritory', function(){
    if(this.selectedTerritory && this.selectedTerritory.id) {
      return this.selectedTerritory.get('districts').sortBy('name');
    } else {
      return this.store.peekAll('district').sortBy('name');
    }
  }),

  dateSlot1: Ember.computed(function(){
    var firstDate = moment(new Date().setHours(0,0,0,0));
    //add dates for testing
    //firstDate=firstDate.add(7, 'day');
    if(firstDate.day() === 0) {
      firstDate=firstDate.add(2, 'day').format('DD MMMM YYYY');
    }
    else if(firstDate.day() === 6) {
      firstDate=firstDate.add(3, 'day').format('DD MMMM YYYY');
    }
    else{
      firstDate=firstDate.add(1, 'day').format('DD MMMM YYYY');
    }
    return firstDate;
  }),

  dateSlot2: Ember.computed(function(){
    var secondDate = moment(this.get('dateSlot1'));
    if(secondDate.day() === 6) {
      secondDate=secondDate.add(3, 'day').format('DD MMMM YYYY');
    }
    else{
      secondDate=secondDate.add(1, 'day').format('DD MMMM YYYY');
    }
    return secondDate;
  }),

  triggerSelectedDate: Ember.observer('selectedDate', function() {
    if(!this.get("selectedDate")) {
      this.set('scheduledDate', moment(this.get('selectedDate')).format('DD MMMM YYYY'));
    }
  }),

  triggerDateOnSwitch: Ember.observer('isSelfSelected', function() {
    this.set('selectedDate',null);
  }),

  gogovanPrice: Ember.computed({
    get: function() {
      new AjaxPromise("/gogovan_orders/calculate_price", "POST", this.session.get('authToken'))
        .then(data => this.set("gogovanPrice", data.base))
        .catch(error => this.get("logger").error(error));
      return "";
    },
    set: function(key, value) {
      return value;
    }
  }),

  getUrlAndMethod(order, url, method) {
    if(order && order.get("isDraft") && order.get("orderTransport")) {
      url = "/order_transports/" + order.get("orderTransport.id");
      method = "PUT";
    } else {
      url = "/order_transports";
      method = "POST";
    }
    return { url: url, method: method };
  },

  isCartEmpty(message) {
    var order = this.store.peekAll("order").filterBy("state", "draft").get("firstObject");
    var messageBox = this.get("messageBox");
    var i18n = this.get("i18n");
    var cartHasItems = this.get("cart.cartItems").length;
    if(!order) {
      messageBox.alert(i18n.t("order.transport_order_detail_pop_up"), () => {
        this.transitionToRoute("order_details");
      });
      return true;
    } else if(!cartHasItems) {
      messageBox.alert(i18n.t(message), () => {
        this.transitionToRoute("index");
      });
      return true;
    } else {
      return false;
    }
  },

  actions: {
    bookSchedule() {
      var cartEmpty = this.isCartEmpty("order.transport_details_pop_up");
      if(cartEmpty) { return false; }
      var order = this.get("store").peekAll("order").filterBy("state", "draft").get("firstObject");
      var url, method, params;
      if(!this.get("selectedTime.name")) {
        Ember.$('.time_selector').addClass('form__control--error');
        return false;
      } else {
        Ember.$('.time_selector').removeClass('form__control--error');
      }
      this.set('displayUserPrompt', false);
      var controller = this;
      var loadingView = getOwner(this).lookup('component:loading').append();
      var transportType = controller.get("selectedId");
      var selectedSlot = controller.get('selectedTime');
      var slotName = controller.get('timeSlots').filterBy('id', selectedSlot.id).get('firstObject.name');
      var selectedDateSlot=controller.get('selectedDate');
      selectedDateSlot= selectedDateSlot===null ? controller.get('dateSlot1'):selectedDateSlot;

      var scheduleDetails = {
        scheduled_at:   selectedDateSlot,
        timeslot:       slotName,
        transport_type: transportType,
        order_id:       this.get("order.id") };

      params = this.getUrlAndMethod(order, url, method);

      url = params["url"];
      method = params["method"];

      new AjaxPromise(url, method, this.get('session.authToken'), { order_transport: scheduleDetails })
        .then(data => {
          this.get("store").pushPayload(data);
          loadingView.destroy();
          this.transitionToRoute("order.confirm", this.get("order.id"));
        });
    },

    bookGGVSchedule() {
      var cartEmpty = this.isCartEmpty("order.transport_details_pop_up");
      if(cartEmpty) { return false; }
      var order = this.get("store").peekAll("order").filterBy("state", "draft").get("firstObject");
      var url, method, params;
      if(!this.get("selectedTime.name")) {
        Ember.$('.time_selector').addClass('form__control--error');
        return false;
      } else {
        Ember.$('.time_selector').removeClass('form__control--error');
      }
      this.set('displayUserPrompt', false);
      var controller = this;
      var loadingView = getOwner(controller).lookup('component:loading').append();
      var selectedDateSlot=controller.get('selectedDate');
      selectedDateSlot = selectedDateSlot===null ? controller.get('dateSlot1'):selectedDateSlot;

      var requestProperties = {};
      requestProperties.scheduled_at = selectedDateSlot;
      requestProperties.timeslot = this.get('selectedTime.name');
      requestProperties.transport_type = controller.get("selectedId");
      requestProperties.need_english = controller.get("speakEnglish");
      requestProperties.need_cart = controller.get("borrowTrolley");
      requestProperties.need_carry = controller.get("porterage");
      requestProperties.order_id = controller.get('order.id');
      requestProperties.gogovan_transport_id = controller.get('selectedGogovanOption');

      if(this.get("isSelectedVan")) {
        requestProperties.need_over_6ft = this.get("longerGoods");
        requestProperties.remove_net = this.get("longGoodSelection");
      }

      requestProperties.contact_attributes = {
        name: controller.get("userName"),
        mobile: "+852" + controller.get("mobilePhone"),
        address_attributes: {
          district_id: controller.get('selectedDistrict.id')
        }
      };

      params = this.getUrlAndMethod(order, url, method);

      url = params["url"];
      method = params["method"];

      new AjaxPromise(url, method, this.get('session.authToken'), { order_transport: requestProperties })
        .then(data => {
          this.get("store").pushPayload(data);
          loadingView.destroy();
          this.transitionToRoute("order.confirm", this.get("order.id"));
        });
    }
  }
});
