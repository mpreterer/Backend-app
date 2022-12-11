const User = require("./models/User.js");
const Role = require("./models/Role.js");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const { secret } = require("./config");

const generateAccessToken = (id, roles) => {
  const payload = {
    id,
    roles,
  };

  return jwt.sign(payload, secret, { expiresIn: "24h" });
};

class authController {
  async registaration(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: "Ошибка регистрации", errors });
      }
      const { phone, password, uname, roles } = req.body;
      const candiate = await User.findOne({ phone });
      if (candiate) {
        return res
          .status(400)
          .json({ message: "Данный номер уже зарегистрирован" });
      }
      const hashPassword = bcrypt.hashSync(password, 7);
      const userRole = await Role.findOne({ value: "User" });
      const checkAdmin = await Role.findOne({ value: "Admin" });

      if (roles === checkAdmin.value) {
        return res
          .status(400)
          .json({ message: "В системе может быть только 1 начальник" });
      }

      const user = new User({
        uname,
        phone,
        password: hashPassword,
        roles: [userRole.value],
      });

      await user.save();
      return res.json({ message: "Пользователь успешно зарегистрирован" });
    } catch (e) {
      res.status(400).json("Registration error");
      console.log(e);
    }
  }

  async login(req, res) {
    try {
      const { phone, password } = req.body;
      const user = await User.findOne({ phone });
      if (!user) {
        return res
          .status(400)
          .json({ message: `Номер телефона или пароль неверный` });
      }

      const validPassword = bcrypt.compareSync(password, user.password);
      if (!validPassword) {
        return res
          .status(400)
          .json({ message: `Номер телефона или пароль неверный` });
      }
      const token = generateAccessToken(user._id, user.roles);
      return res.json({ token });
    } catch (e) {
      res.status(400).json("login error");
      console.log(e);
    }
  }

  async getUsers(req, res) {
    try {
      const users = await User.find();
      res.json(users);
      res.json("server ok");
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = new authController();
