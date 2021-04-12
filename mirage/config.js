export default function() {
  // These comments are here to help you get started. Feel free to delete them.

  /*
    Config (with defaults).

    Note: these only affect routes defined *after* them!
  */

  // this.urlPrefix = '';    // make this `http://localhost:8080`, for example, if your API is on a different server
  // this.namespace = '';    // make this `api`, for example, if your API is namespaced
  // this.timing = 400;      // delay for each request, automatically set to 0 during testing

  /*
    Shorthand cheatsheet:

    this.get('/posts');
    this.post('/posts');
    this.get('/posts/:id');
    this.put('/posts/:id'); // or this.patch
    this.del('/posts/:id');

    http://www.ember-cli-mirage.com/docs/v0.2.0-beta.7/shorthands/
  */

  //  this.namespace = 'api';
  this.urlPrefix = "http://localhost:3000";
  this.namespace = "/api/v1";

  this.get("/purposes");

  this.get("/gogovan_transports");

  this.get("/booking_types");

  this.get("/auth/current_user_profile", (schema, request) => {
    return [
      {
        user_profile: {
          address_id: 20,
          disabled: false,
          email: "rosalie@wolf.biz",
          first_name: "Sally",
          id: 20,
          image_id: 20,
          is_email_verified: false,
          is_mobile_verified: true,
          last_connected: "2021-04-12T16:14:23.720+08:00",
          last_disconnected: "2021-04-12T16:14:26.303+08:00",
          last_name: "Salwa92",
          max_role_level: 0,
          mobile: "91111112"
        }
      }
    ];
  });

  this.get("/cancellation_reasons");

  this.get("/goodcity_settings");

  this.get("/package_types");

  this.get("/donor_conditions");

  this.get("/package_categories");

  this.get("/territories");

  this.get("/districts");

  this.get("/packages", () => {});

  this.get("/requested_packages");
}
