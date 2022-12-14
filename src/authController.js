const User = require("./models/User.js");
const Role = require("./models/Role.js");
const Guest = require("./models/Guest.js");
const Macs = require("./models/Macs.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { secret } = require("./config");
const macs = require("./utils/macs");

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
        status: "",
        date: "",
      });

      await user.save();
      return res.json({
        result: 0,
        description: "OK",
      });
    } catch (e) {
      res.status(400).json({ description: "Ошибка регистрации" });
      console.log(e);
    }
  }

  async login(req, res) {
    try {
      const { phone, password, guest, login } = req.body;
      const macs = await Macs.find();
      const resMacs = [];

      macs.forEach((el) => {
        resMacs.push({ mac: el.mac, confirm: el.confirm });
      });

      const date = new Date().toLocaleString();
      const reditDate = date.split(".");
      const reditTime = date.split(".")[2].slice(6, 11);

      if (guest === 1) {
        const tokenGuest = generateAccessToken(login);
        const roleGuest = await Role.findOne({ value: "Guest" });

        const user = new Guest({
          login,
          role: roleGuest.value,
          status: "online",
          date: `${reditDate[0]}-${reditDate[1]}-${reditDate[2].slice(
            0,
            4
          )} ${reditTime}`,
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
          macs: resMacs,
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
      if (user.role === "User") {
        userCode = 1;
      }

      await user.updateOne({
        status: "online",
        date: `${reditDate[0]}-${reditDate[1]}-${reditDate[2].slice(
          0,
          4
        )} ${reditTime}`,
      });

      return res.json({
        result: 0,
        description: "OK",
        username: user.uname,
        access_token: token,
        expires_in: 5999,
        user: userCode,
        user_id: user._id,
        macs: resMacs,
      });
    } catch (e) {
      res.status(400).json({ description: "Ошибка авторизации" });
      console.log(e);
    }
  }

  async workerList(req, res) {
    try {
      const users = await User.find();
      res.json({ result: 0, description: "OK", list: users });
    } catch (e) {
      console.log(e);
    }
  }

  async online(req, res) {
    try {
      const { mac, id_user, alert } = req.body;
      const hasMac = await Macs.findOne({ mac: mac });
      const date = new Date().toLocaleString();
      const reditDate = date.split(".");
      const reditTime = date.split(".")[2].slice(6, 11);

      let user = await User.findOne({ _id: id_user });

      if (!user) {
        user = await Guest.findOne({ _id: id_user });
      }

      if (hasMac) {
        await user.updateOne({
          status: alert === 1 ? "alert" : "online",
          date: `${reditDate[0]}-${reditDate[1]}-${reditDate[2].slice(
            0,
            4
          )} ${reditTime}`,
        });

        return res.json({ result: 0, description: "OK" });
      }

      await user.updateOne({
        status: alert === 1 ? "alert" : "offline",
        date: `${reditDate[0]}-${reditDate[1]}-${reditDate[2].slice(
          0,
          4
        )} ${reditTime}`,
      });
      return res.json({ result: 3, description: "Не авторизован" });
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = new authController();
