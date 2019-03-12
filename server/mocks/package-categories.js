module.exports = function(app) {
  var express = require("express");
  var packageCategoriesRouter = express.Router();
  packageCategoriesRouter.get("/", function(req, res) {
    res.send({
      package_categories: [
        {
          id: 1,
          name: "Computer",
          package_type_codes: "FTF, FSC",
          parent_id: null
        },
        { id: 2, name: "Ext", package_type_codes: "FTF, FSC", parent_id: "1" }
      ]
    });
  });
  app.use("/api/v1/package_categories", packageCategoriesRouter);
};
