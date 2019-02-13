import applicationController from './application';
import Ember from 'ember';
import _ from 'lodash';
import AjaxPromise from 'browse/utils/ajax-promise';

export default applicationController.extend({
  sortProperties: ["createdAt:desc"],
  isPrivate: false,
  arrangedOrders: Ember.computed.sort("model.orders", "sortProperties"),
  selectedOrder: null,
  orders: Ember.computed.alias('model'),
  flashMessage: Ember.inject.service(),
  messageBox: Ember.inject.service(),
  queryParams: ['submitted'],
  triggerFlashMessage: false,
  previousRouteName: null,
  showCancelBookingPopUp: false,
  cancellationReasonWarning: false,
  applicationController: Ember.inject.controller('application'),
  hideHeaderBar: Ember.computed.alias("applicationController.hideHeaderBar"),
  messageSortOptions: ['createdAt:asc'],
  noMessage: Ember.computed.empty("selectedOrder.messages"),

  displayChatNote: Ember.computed('noMessage', 'disabled', function () {
    return this.get("noMessage") && !this.get("disabled");
  }),

  sortedMessages: Ember.computed.sort("selectedOrder.messages", "messageSortOptions"),

  groupedMessages: Ember.computed("sortedMessages", function () {
    return this.groupBy(this.get("sortedMessages"), "createdDate");
  }),

  groupBy: function (content, key) {
    var result = [];
    var object, value;

    content.forEach(function (item) {
      value = item.get ? item.get(key) : item[key];
      object = result.findBy('value', value);
      if (!object) {
        object = {
          value: value,
          items: []
        };
        result.push(object);
      }
      return object.items.push(item);
    });
    return result.getEach('items');
  },

  getCategoryForCode: function (code) {
    const categories = this.get('model.packageCategories');
    const category = categories.find(c => _.includes(c.get('packageTypeCodes'), code));
    return category && category.get('name');
  },

  selectedOrderId: Ember.computed("selectedOrder", function() {
    return this.get("selectedOrder.id");
  }),

  fetchPackageImages(pkg) {
    return Ember.RSVP.all(
      pkg.getWithDefault('imageIds', []).map(id => this.store.findRecord('image', id, { reload: false }))
    );
  },

  fetchMissingImages(order) {
    const ordersPackages = order.getWithDefault('ordersPackages', []);
    return Ember.RSVP.all(
      ordersPackages.map(op => this.fetchPackageImages(op.get('package')))
    );
  },

  requestedGoods: Ember.computed('selectedOrder', 'model.packageCategories', function () {
    const requests = this.getWithDefault('selectedOrder.goodcityRequests', []);
    return requests.map(req => ({
      category: this.getCategoryForCode(req.get('packageType.code')),
      text: req.get('packageType.name')
    }));
  }),

  hasRequestedGoods: Ember.computed.notEmpty('requestedGoods'),

  orderedGoods: Ember.computed('selectedOrder', 'model.packageCategories', function () {
    const orderPackages = this.getWithDefault('selectedOrder.ordersPackages', []);
    return orderPackages.map(op => ({
      notes: op.get('package.notes'),
      text: op.get('package.packageType.name'),
      imageUrl: op.get('package.previewImageUrl')
    }));
  }),

  hasOrderedGoods: Ember.computed.notEmpty('orderedGoods'),

  submitted: false,
  orderSummaryTabs: [
    {
      name: 'booking',
      icon: 'calendar'
    },
    {
      name: 'goods',
      icon: 'shopping-basket'
    },
    {
      name: 'messages',
      icon: 'comment-o'
    }
  ],

  submittedOrderFlashMessage: Ember.observer("submitted", 'triggerFlashMessage', function() {
    if(this.get("submitted") && (this.get("previousRouteName") === "order.confirm")) {
      this.get("flashMessage").show("order.flash_submit_message");
    }
  }),

  showLoadingSpinner() {
    if (Ember.testing) {
      return;
    }
    if (!this.loadingView) {
      this.loadingView = Ember.getOwner(this).lookup('component:loading').append();
    }
  },

  hideLoadingSpinner() {
    if (Ember.testing) {
      return;
    }
    if (this.loadingView) {
      this.loadingView.destroy();
      this.loadingView = null;
    }
  },

  deleteOrder(order) {
    var _this = this;
    this.showLoadingSpinner();
    new AjaxPromise("/orders/" + order.id, "DELETE", _this.get('session.authToken'))
      .then(data => {
        _this.get("cart").clearItems();
        if(order) {
          _this.store.pushPayload(data);
          _this.store.unloadRecord(order);
        }
      })
      .catch(() => {
        this.get("messageBox").alert();
      })
      .finally(() => {
        this.hideLoadingSpinner();
        this.set("showCancelBookingPopUp", false);
        _this.transitionToRoute("home");
      });
  },

  cancelOrder(order) {
    let cancellationReason = Ember.$(`#appointment-cancellation-reason`).val().trim();
    if(!cancellationReason.length) {
      this.set("cancellationReasonWarning", true);
      Ember.$('#appointment-cancellation-reason').addClass("cancel-booking-error");
      return false;
    } else {
      Ember.$('#appointment-cancellation-reason').removeClass("cancel-booking-error");
      this.set("cancellationReasonWarning", false);
    }
    var url = `/orders/${order.id}/transition`;
    this.showLoadingSpinner();
    new AjaxPromise(url, "PUT", this.get('session.authToken'), { transition: "cancel", cancellation_reason: cancellationReason })
      .then(data => {
        this.get("store").pushPayload(data);
      })
      .catch(() => {
        this.get("messageBox").alert();
      })
      .finally(() => {
        this.hideLoadingSpinner();
        this.set("showCancelBookingPopUp", false);
      });
  },

  createMessage(values) {
    var message = this.store.createRecord("message", values);
    message.save()
      .then(() => {
        this.set("body", "");
      })
      .catch(error => {
        this.store.unloadRecord(message);
        throw error;
      });
  },

  actions: {
    redirectToEdit(routeName) {
      let orderId = this.get("selectedOrder.id");
      this.transitionToRoute(`order.${routeName}`, orderId);
    },

    editRequestPurpose() {
      let orderId = this.get("selectedOrder.id");
      this.transitionToRoute(`request_purpose`,
        {
          queryParams: {
            orderId: orderId,
            bookAppointment: false,
            editRequest: true
          }
        });
    },

    cancelBookingPopUp() {
      this.set("showCancelBookingPopUp", true);
    },

    removePopUp() {
      this.set("showCancelBookingPopUp", false);
    },

    cancelOrder() {
      let order = this.get("selectedOrder");
      if(order) {
        if(order.get("isDraft")) {
          this.deleteOrder(order);
        } else if(order.get("isCancelAllowed")) {
          this.cancelOrder(order);
        }
      }
    },

    setOrder(order) {
      if (!order) {
        this.set('selectedOrder', null);
        this.get('applicationController').set('hideHeaderBar', false);
        return;
      }
      // Request the order to load dependant associations
      this.showLoadingSpinner();
      this.store.findRecord('order', order.get('id'), { reload: true, adapterOptions: { includePackages: 'false'} })
        .then(record => this.fetchMissingImages(record).then(_.constant(record)))
        .then(record => {
          this.set('selectedOrder', record);
          this.set('selectedOrderTab', this.orderSummaryTabs[0]);
          this.get('applicationController').set('hideHeaderBar', true);
        })
        .catch(() => {
          this.get("messageBox").alert();
        })
        .finally(() => this.hideLoadingSpinner());
    },
    selectTab(tab) {
      if (tab !== this.get('selectedOrderTab')) {
        this.set('selectedOrderTab', tab);
      }
    },
    sendMessage(){
      Ember.$("textarea").trigger('blur');
      var values = this.getProperties("body");
      values.order = this.get('selectedOrder');
      values.createdAt = new Date();
      values.isPrivate = false;
      values.sender = this.store.peekRecord("sender", this.get("session.currentUser.id"));
      this.createMessage(values);

      // Animate and scroll to bottom
      Ember.$("body").animate({
        scrollTop: Ember.$(document).height()
      }, 1000);
    }
  }
});
