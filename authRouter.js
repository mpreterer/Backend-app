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
router.get("/users", roleMiddleWare(['Admin']), controller.getUsers);

module.exports = router;
