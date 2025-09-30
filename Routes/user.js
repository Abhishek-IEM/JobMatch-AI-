const express = require("express");
const router = express.Router();
const UserController = require("../Controllers/user")
const uplaod = require("../utils/multer")

router.post("/", UserController.register);

module.exports = router;