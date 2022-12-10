const Router = require("express");
const controller = require("./authController.js");
const router = new Router();
const { check } = require("express-validator");

router.post(
  "/registration",
  [
    check("uname", "Имя пользователя не может быть пустым").notEmpty(),
    check("password", "Пароль должен быть больше 3 символов").isLength({
      min: 4,
      max: 20
    }),
  ],
  controller.registaration
);
router.post("/login", controller.login);
router.get("/users", controller.getUsers);

module.exports = router;
