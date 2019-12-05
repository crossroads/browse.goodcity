import Ember from "ember";
import { translationMacro as t } from "ember-i18n";

export default Ember.Controller.extend({
  i18n: Ember.inject.service(),
  questionLinks: Ember.computed("", function() {
    var i18n = this.get("i18n");
    let questions = [];
    [
      "question1",
      "question2",
      "question3",
      "question4",
      "question5",
      "question6",
      "question7"
    ].forEach(function(question) {
      questions.push({
        id: `#${question}`,
        text: i18n.t(`faq.questions.${question}`)
      });
    });
    return questions;
  })
});
