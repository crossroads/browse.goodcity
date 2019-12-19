import { computed } from "@ember/object";
import { inject as service } from "@ember/service";
import Controller from "@ember/controller";
import { translationMacro as t } from "ember-i18n";

export default Controller.extend({
  i18n: service(),
  questionLinks: computed("", function() {
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
