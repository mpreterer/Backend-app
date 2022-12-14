const Router = require("express");
const controller = require("./authController.js");
const router = new Router();
const authMiddleWare = require("./middleware/authMiddleWare.js");
const roleMiddleWare = require("./middleware/roleMiddleWare.js");

router.post("/registration", controller.registaration);
router.post("/login", controller.login);
router.get("/workerList", roleMiddleWare("Admin"), controller.workerList);
router.post("/online", authMiddleWare, controller.online);
router.post("/logout", controller.logout);

module.exports = router;
