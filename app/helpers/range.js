import { helper as buildHelper } from "@ember/component/helper";

// Inclusive rannge
export default buildHelper(function([min, max]) {
  let nums = [];
  for (let i = min; i <= max; ++i) {
    nums.push(i);
  }
  return nums;
});
