import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route("home");
  this.route("browse");
  this.route('package_category', { path: '/category/:id' });
  this.route('item', { path: '/item/:id' });
  this.route('package', { path: '/package/:id' });
  this.route('cart');

  this.route('login');
  this.route('account_details');
  this.route('post_login');
  this.route('authenticate');
  this.route('search_organisation');

  this.route('my_orders');

  this.route('orders', function(){
    this.route('detail', { path: '/:order_id'});
    this.route('booking', { path: '/:order_id/booking'});
    this.route('goods', { path: '/:order_id/goods'});
    this.route('conversation', {
      path: '/:order_id/conversation'
    });
  });

  this.route('order', { path: '/order/:order_id/' }, function() {
    this.route('confirm');
    this.route('client_information');
    this.route('goods_details');
    this.route("search_code");
    this.route('schedule_details');
    this.route('confirm_booking');
    this.route('booking_success');
  });

  this.route('confirm');
  this.route('not-found', { path: '/*path' });
  this.route('privacy');
  this.route('faq');
  this.route('terms');
  this.route('about');
  this.route('request_purpose');
});

export default Router;
