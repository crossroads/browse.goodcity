import { reject } from "rsvp";
import { sort, alias } from "@ember/object/computed";
import applicationController from "./application";
import { inject as service } from "@ember/service";

export default applicationController.extend({
  offerResponses: alias("model"),

  sortProperties: ["createdAt:desc"],
  arrangedOrders: sort("offerResponses", "sortProperties"),

  actions: {}
});
