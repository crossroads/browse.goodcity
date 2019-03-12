module.exports = {
  scenarios: [
    {
      name: "default",
      bower: {
        dependencies: {}
      }
    },
    {
      name: "ember-2.11.0",
      bower: {
        dependencies: {
          ember: "2.11.0"
        }
      }
    }
  ]
};

//ember try:one ember-2.11.0 --- ember serve --port 4202
//ember try:reset
