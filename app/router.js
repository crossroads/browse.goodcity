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
  this.route('post_login');
  this.route('authenticate');

  this.route('order_details');
  this.route('my_orders');

  this.route('order', { path: '/order/:order_id/' }, function() {
    this.route('transport_details');
    this.route('confirm');
  });

  this.route('confirm');
  this.route('not-found', { path: '/*path' });
  this.route('privacy');
  this.route('faq');
  this.route('terms');
  this.route('about');
});

export default Router;
