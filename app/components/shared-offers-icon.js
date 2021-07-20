import Component from "@ember/component";
import { inject as service } from "@ember/service";
import { alias, gt } from "@ember/object/computed";

export default Component.extend({
  messages: service(),

  unreadSharedOffersMessagesCount: alias(
    "messages.unreadSharedOffersMessagesCount"
  ),

  hasMessages: gt("unreadSharedOffersMessagesCount", 0)
});
