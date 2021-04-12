import { test } from "qunit";
import moduleForAcceptance from "browse/tests/helpers/module-for-acceptance";

moduleForAcceptance("Acceptance | home-test");

// test("should redirect to home page", function(assert) {
//   visit("/").then(function() {
//     assert.equal(currentURL(), "/home");
//   });
// });

test("should link to the browse page", function(assert) {
  visit("/").then(function() {
    let links = $(".home_page a").filter((key, link) => /\/browse$/.test(link));
    assert.ok(links.length >= 1);
  });
});
