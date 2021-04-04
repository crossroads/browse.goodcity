import Component from "@ember/component";
import { inject as service } from "@ember/service";
import { alias } from "@ember/object/computed";
import { computed } from "@ember/object";

export default Component.extend({
  messages: service(),

  unreadMessageCount: alias("messages.unreadMessageCount"),

  hasMessages: computed("unreadMessageCount", function() {
    return this.get("unreadMessageCount") > 0;
  })
});
