module.exports = function(app) {
  var express = require("express");
  var donorConditionsRouter = express.Router();
  donorConditionsRouter.get("/", function(req, res) {
    res.send({
      donor_conditions: [
        { id: 1, name: "New" },
        { id: 4, name: "Broken" },
        { id: 2, name: "Lightly Used" },
        { id: 3, name: "Heavily Used" }
      ]
    });
  });
  app.use("/api/v1/donor_conditions", donorConditionsRouter);
};
