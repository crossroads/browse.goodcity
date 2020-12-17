import AuthorizeRoute from "./../authorize";

export default AuthorizeRoute.extend({
  model({ offer_id }) {
    return offer_id;
  }
});
