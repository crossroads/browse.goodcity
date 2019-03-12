module.exports = function(app) {
  var express = require("express");
  var itemTypesRouter = express.Router();
  itemTypesRouter.get("/", function(req, res) {
    res.send({
      item_types: [
        { id: 1, name: "Bed - Baby crib", code: "BBC" },
        { id: 2, name: "Bed - Baby mattress", code: "BBM" },
        { id: 3, name: "Bed - Baby's crib with mattress", code: "BBS" },
        { id: 4, name: "Bed - child's base", code: "BCB" },
        { id: 5, name: "Bed - Childs Mattress", code: "BCM" }
      ]
    });
  });
  app.use("/api/v1/item_types", itemTypesRouter);
};
