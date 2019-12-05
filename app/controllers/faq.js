import Ember from "ember";
import { translationMacro as t } from "ember-i18n";

export default Ember.Controller.extend({
  i18n: Ember.inject.service(),
  questionLinks: Ember.computed("", function() {
    var i18n = this.get("i18n");
    let questions = [];
    [...Array(7)].map((i, index) => {
      questions.push({
        id: `#question${index + 1}`,
        text: i18n.t(`faq.questions.question${index + 1}`)
      });
    });
    return questions;
  })
});
