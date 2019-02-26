import Ember from "ember";

export default Ember.Helper.helper(function (value) {
  value = Ember.Handlebars.Utils.escapeExpression(value || "");
  value = value.replace(/(\r\n|\n|\r)/gm, '<br>');
  return new Ember.String.htmlSafe(value);
});
