import Ember from "ember";

export default Ember.Mixin.create({
  getOptions(version, crop, height, width, id) {
    return {
      version: version,
      height: height,
      width: width,
      crop: crop === true ? "fill" : "fit",
      flags: "progressive",
      id: id,
      secure: true,
      protocol: "https:",
      default_image: "default_item_image.jpg"
    };
  },

  generateUrl: function(width, height, crop) {
    //e.g. cloudinaryId = 1406959628/wjvaksnadntp239n6vwe.png
    var id = this.get("cloudinaryId") || "1438323699/default_item_image.jpg";
    var angle = this.get("angle") || 0;
    if (!id || id.indexOf("/") === -1) {
      return null;
    }
    var version = id.split("/")[0];
    var filename = id.substring(id.indexOf("/") + 1);
    var options = this.getOptions(version, crop, height, width, id);
    if (angle) {
      options["angle"] = angle;
    }
    return Ember.$.cloudinary.url(filename, options);
  }
});
