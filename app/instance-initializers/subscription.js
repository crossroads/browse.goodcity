export default {
  name: "subscription",
  initialize: function(app) {
    const { container = app } = app;
    const subscriptions = container.lookup("service:subscription");

    subscriptions.before("update", "package", data => {
      if (!data.record.allow_web_publish) {
        data.operation = "delete";
      }
    });
  }
};
