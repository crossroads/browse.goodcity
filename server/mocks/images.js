module.exports = function(app) {
  var express = require("express");
  var imagesRouter = express.Router();

  imagesRouter.get("/", function(req, res) {
    res.send({ images: [] });
  });

  app.use("/api/v1/images/", imagesRouter);
};
