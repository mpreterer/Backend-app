const Router = require("express");
const controller = require("./authController.js");
const router = new Router();
const { check } = require("express-validator");
const authMiddleWare = require("./middleware/authMiddleWare.js");
const roleMiddleWare = require("./middleware/roleMiddleWare.js");

router.post(
  "/registration",
  [
    check("phone", "Номер телефона не может быть пустым").notEmpty(),
    check("uname", "ФИО не может быть пустым").notEmpty(),
    check("uname", "ФИО должно быть не меньше 6 и не больше 50 символов").isLength({
      min: 6,
      max: 50,
    }),
    check(
      "password",
      "Пароль должен быть не меньше 8 и не больше 20 символов"
    ).isLength({
      min: 8,
      max: 20,
    }),
  ],
  controller.registaration
);
router.post("/login", controller.login);
router.get("/workerList", roleMiddleWare('Admin'), controller.workerList);

module.exports = router;
