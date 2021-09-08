import Component from "@ember/component";
import { inject as service } from "@ember/service";
import { alias, gt } from "@ember/object/computed";

export default Component.extend({
  messages: service(),

  unreadOrdersMessagesCount: alias("messages.unreadOrdersMessagesCount"),

  hasMessages: gt("unreadOrdersMessagesCount", 0)
});
