import { helper as buildHelper } from "@ember/component/helper";

const OPS = {
  "+": (a, b) => a + b,
  "-": (a, b) => a - b,
  "*": (a, b) => a * b,
  "/": (a, b) => a / b,
  "%": (a, b) => a % b
};

export default buildHelper(function([lvalue, operator, rvalue]) {
  const leftNumber = parseFloat(lvalue);
  const rightNumber = parseFloat(rvalue);
  return OPS[operator](leftNumber, rightNumber);
});
