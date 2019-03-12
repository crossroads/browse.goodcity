export default {
  name: "session",
  initialize: function(application) {
    application.inject("controller", "session", "service:session");
    application.inject("route", "session", "service:session");
    application.inject("component", "session", "service:session");
    application.inject("controller", "cart", "service:cart");
    application.inject("route", "cart", "service:cart");
    application.inject("component", "cart", "service:cart");
    application.inject("controller", "screenresize", "service:screenresize");
    application.inject("route", "screenresize", "service:screenresize");
    application.inject("component", "screenresize", "service:screenresize");
    application.inject("component", "router", "router:main");
  }
};
