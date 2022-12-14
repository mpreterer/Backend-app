const Router = require("express");
const controller = require("./authController.js");
const router = new Router();
const { check } = require("express-validator");
const authMiddleWare = require("./middleware/authMiddleWare.js");
const roleMiddleWare = require("./middleware/roleMiddleWare.js");

router.post("/registration", controller.registaration);
router.post("/login", controller.login);
router.get("/workerList", roleMiddleWare("Admin"), controller.workerList);
router.get("/online", authMiddleWare, controller.online);

module.exports = router;
