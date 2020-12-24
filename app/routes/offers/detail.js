import PublicRoute from "../browse_pages";
import { inject as service } from "@ember/service";
import _ from "lodash";

export default PublicRoute.extend({
  offerService: service(),

  model({ offer_id }) {
    return this.get("offerService").getDetailOffer(offer_id);
  }
});
