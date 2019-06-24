import AjaxPromise from "browse/utils/ajax-promise";

export default {
  name: "ajax",
  initialize: function(app) {
    const { container = app } = app;
    const adapter = container.lookup("adapter:application");

    AjaxPromise.setDefaultHeaders(() => {
      return adapter.get("headers");
    });
  }
};
