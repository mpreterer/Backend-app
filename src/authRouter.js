const Router = require("express");
const controller = require("./authController.js");
const router = new Router();
const authMiddleWare = require("./middleware/authMiddleWare.js");
const roleMiddleWare = require("./middleware/roleMiddleWare.js");
// roleMiddleWare("Admin")
router.post("/registration", controller.registaration);
router.post("/login", controller.login);
router.get("/workerList", controller.workerList);
// authMiddleWare
router.post("/online", controller.online);
router.get("/logout", controller.logout);

module.exports = router;
