const User = require("./models/User.js");
const Role = require("./models/Role.js");
const Guest = require("./models/Guest.js");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const { secret } = require("./config");

const generateAccessToken = (id, role) => {
  const payload = {
    id,
    role,
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
      const { phone, password, uname } = req.body;
      const candiate = await User.findOne({ phone });
      if (candiate) {
        return res
          .status(400)
          .json({ result: 1, description: "Данный номер уже зарегистрирован" });
      }
      const hashPassword = bcrypt.hashSync(password, 7);
      let userRole = await Role.findOne({ value: "User" });

      const user = new User({
        uname,
        phone,
        password: hashPassword,
        role: userRole.value,
      });

      await user.save();
      return res.json({
        message: `Пользователь успешно зарегистрирован`,
        result: 0,
        description: "OK",
      });
    } catch (e) {
      res.status(400).json("Registration error");
      console.log(e);
    }
  }

  async login(req, res) {
    try {
      const { phone, password, guest, login } = req.body;

      if (guest === 1) {
        const tokenGuest = generateAccessToken(login);
        const roleGuest = await Role.findOne({ value: "Guest" });

        const user = new Guest({
          login,
          role: roleGuest.value,
        });

        await user.save();

        return res.json({
          result: 0,
          description: "OK",
          username: login,
          access_token: tokenGuest,
          expires_in: 5999,
          user: 0,
          user_id: user._id,
          macs: [
            {
              mac: "50:ff:20:6e:31:84",
              confirm: 1,
            },
            {
              mac: "50:ff:20:6e:31:83",
              confirm: 0,
            },
          ],
        });
      }

      const user = await User.findOne({ phone });
      if (!user) {
        return res.status(400).json({
          result: 2,
          description: "Номер телефона или пароль неверный",
        });
      }

      const validPassword = bcrypt.compareSync(password, user.password);
      if (!validPassword) {
        return res.status(400).json({
          result: 2,
          description: "Номер телефона или пароль неверный",
        });
      }
      const token = generateAccessToken(user._id, user.role);
      let userCode = 0;

      if (user.role === "Admin") userCode = 2;
      if (user.role === "User") userCode = 1;

      return res.json({
        result: 0,
        description: "OK",
        username: user.uname,
        access_token: token,
        expires_in: 5999,
        user: userCode,
        user_id: user._id,
        macs: [
          {
            mac: "50:ff:20:6e:31:84",
            confirm: 1,
          },
          {
            mac: "50:ff:20:6e:31:83",
            confirm: 0,
          },
        ],
      });
    } catch (e) {
      res.status(400).json("login error");
      console.log(e);
    }
  }

  async workerList(req, res) {
    try {
      const users = await User.find();
      res.json({result: 0, description: "OK", list: users});
      res.json("server ok");
    } catch (e) {
      console.log(e);
    }
  }

  async logout(req, res) {
    try {
    } catch (e) {}
  }
}

module.exports = new authController();
