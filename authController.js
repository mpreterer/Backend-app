const User = require("./models/User.js");
const Role = require("./models/Role.js");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

const generateAccessToken = (id, roles) => {
  const payload = {
    id,
    roles,
  };

  return jwt.sign();
};

class authController {
  async registaration(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: "Ошибка регистрации", errors });
      }
      const { uname, password } = req.body;
      const candiate = await User.findOne({ uname });
      if (candiate) {
        return res
          .status(400)
          .json({ message: "Пользователь уже зарегистрирован" });
      }
      const hashPassword = bcrypt.hashSync(password, 7);
      const userRole = await Role.findOne({ value: "User" });
      const user = new User({
        uname,
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
      const { uname, password } = req.body;
      const user = await User.findOne({ uname });
      if (!user) {
        return res
          .status(400)
          .json({ message: `Пользователь ${uname} не найден` });
      }

      const validPassword = bcrypt.compareSync(password, user.password);
      if (!validPassword) {
        return res.status(400).json({ message: `Неверный пароль` });
      }
      const token = generateAccessToken();
    } catch (e) {
      res.status(400).json("Login error");
      console.log(e);
    }
  }

  async getUsers(req, res) {
    try {
      //   const userRole = new Role();
      //   const adminRole = new Role({ value: "Admin" });

      //   await userRole.save();
      //   await adminRole.save();

      res.json("server ok");
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = new authController();
