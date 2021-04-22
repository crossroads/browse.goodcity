import Component from "@ember/component";
import { inject as service } from "@ember/service";
import { alias, gt } from "@ember/object/computed";

export default Component.extend({
  messages: service(),

  unreadMessageCount: alias("messages.unreadMessageCount"),

  hasMessages: gt("unreadMessageCount", 0)
});
