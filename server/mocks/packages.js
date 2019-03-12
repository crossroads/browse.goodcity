module.exports = function(app) {
  var express = require("express");
  var packagesRouter = express.Router();

  var packages = [
    { id: "1", item_id: null, notes: "package1", package_type_id: "1" },
    { id: "2", item_id: null, notes: "package2", package_type_id: "2" }
  ];

  var packageTypes = [
    { id: "1", code: "FTF", name: "code1" },
    { id: "2", code: "FSC", name: "code2" }
  ];

  var packages_json = {
    package: packages,
    package_types: packageTypes
  };

  packagesRouter.get("/", function(req, res) {
    res.send(packages_json);
  });

  app.use("/api/v1/packages", packagesRouter);
  app.use("/api/v1/packages/:id", packagesRouter);
};
