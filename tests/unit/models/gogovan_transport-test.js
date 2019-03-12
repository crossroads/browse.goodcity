import Ember from "ember";
import { test, moduleForModel } from "ember-qunit";

moduleForModel("gogovan_transport", {});

test("Check attributes", function(assert) {
  assert.expect(2);

  var model = this.subject();

  var name = Object.keys(model.toJSON()).indexOf("name") > -1;
  var disabled = Object.keys(model.toJSON()).indexOf("disabled") > -1;

  assert.ok(name);
  assert.ok(disabled);
});

test("gogovan_transport is valid data model", function(assert) {
  assert.expect(1);

  var store = this.store();
  var record = null;

  Ember.run(function() {
    store.createRecord("gogovanTransport", { id: 1, name: "gogovan" });
    record = store.peekRecord("gogovanTransport", 1);
  });

  assert.equal(record.get("name"), "gogovan");
});

test("computed property: specialId", function(assert) {
  assert.expect(1);
  var gogovanTransport = this.subject({ id: 1, name: "gogovan" });
  assert.equal(gogovanTransport.get("specialId"), "1_ggv");
});
