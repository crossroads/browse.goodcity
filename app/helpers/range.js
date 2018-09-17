import Ember from "ember";

// Inclusive rannge
export default Ember.Helper.helper(function([min, max]) {
  let nums = [];
  for (let i = min; i <= max; ++i) {
    nums.push(i);
  }
  return nums;
});
