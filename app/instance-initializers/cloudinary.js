import $ from "jquery";
import config from "../config/environment";

export default {
  name: "cloudinary",
  initialize() {
    $.cloudinary.config({
      cloud_name: config.APP.CLOUD_NAME,
      api_key: config.APP.CLOUD_API_KEY
    });
  }
};
