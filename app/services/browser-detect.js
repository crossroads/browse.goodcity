import Service from "@ember/service";

export default Service.extend({
  ie() {
    return (
      navigator.userAgent.indexOf("MSIE") != -1 ||
      !!document.documentMode == true
    );
  }
});
