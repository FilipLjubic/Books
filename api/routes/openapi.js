const express = require("express");
const router = express.Router();
const fs = require("fs");

router.get("/", async (req, res, next) => {
  try {
    const openapi = JSON.parse(fs.readFileSync("openapi.json"));

    res.json(openapi);
  } catch (err) {
    err.type = "not-found";

    next(err);
  }
});

module.exports = router;
