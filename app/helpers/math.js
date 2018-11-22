import Ember from "ember";

const OPS = {
  "+": (a, b) => a + b,
  "-": (a, b) => a - b,
  "*": (a, b) => a * b,
  "/": (a, b) => a / b,
  "%": (a, b) => a % b
};

export default Ember.Helper.helper(function([lvalue, operator, rvalue]) {
  const leftNumber = parseFloat(lvalue);
  const rightNumber = parseFloat(rvalue);
  return OPS[operator](leftNumber, rightNumber);
});
