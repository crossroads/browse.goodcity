import config from "../../config/environment";
import "../factories/package_type";
import "../factories/package_category";
import "../factories/donor_condition";

export default function(testHelper) {
  config.APP.PRELOAD_TYPES.concat(config.APP.PRELOAD_TYPES).forEach(function(
    type
  ) {
    testHelper.mockFindAll(type, 0);
  });

  //hide sync-data related mocks from console, but show test related mocks
  $.mockjaxSettings.logging = false;
  testHelper.container.lookup("router:main").one("didTransition", function() {
    $.mockjaxSettings.logging = true;
  });
}
