import EmberRouter from "@ember/routing/router";
import config from "./config/environment";
import googlePageview from "./mixins/google-pageview";

const Router = EmberRouter.extend(googlePageview, {
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route("home");
  this.route("browse");
  this.route("package_category", {
    path: "/category/:id"
  });
  this.route("offers", function() {
    this.route("detail", {
      path: "/:offer_id"
    });
    this.route("messages", {
      path: "/:offer_id/messages"
    });
  });
  this.route("package_set", {
    path: "/package_set/:id"
  });
  this.route("package", {
    path: "/package/:id"
  });
  this.route("cart");

  this.route("login");
  this.route("account_details");
  this.route("submitted_order_selection");
  this.route("post_login");
  this.route("authenticate");
  this.route("search_organisation");
  this.route("search_goods");

  this.route("my_orders");
  this.route("my_account");

  this.route("orders", function() {
    this.route("detail", {
      path: "/:order_id"
    });
    this.route("booking", {
      path: "/:order_id/booking"
    });
    this.route("goods", {
      path: "/:order_id/goods"
    });
    this.route("conversation", {
      path: "/:order_id/conversation"
    });
  });

  this.route(
    "order",
    {
      path: "/order/:order_id/"
    },
    function() {
      this.route("confirm");
      this.route("client_information");
      this.route("goods_details");
      this.route("schedule_details");
      this.route("confirm_booking");
      this.route("booking_success");
    }
  );

  this.route("confirm");
  this.route("not-found", {
    path: "/*path"
  });
  this.route("privacy");
  this.route("faq");
  this.route("terms");
  this.route("about");
  this.route("request_purpose");
});

export default Router;
