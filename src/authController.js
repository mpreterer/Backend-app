const User = require("./models/User.js");
const Role = require("./models/Role.js");
const Guest = require("./models/Guest.js");
const Macs = require("./models/Macs.js");
const bcrypt = require("bcryptjs");
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

      const date = new Date();
      const year = date.getFullYear();
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const reditTime = date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      macs.forEach((el) => {
        resMacs.push({ mac: el.mac });
      });

      if (guest === 1) {
        const roleGuest = await Role.findOne({ value: "Guest" });
        const userGuest = await Guest.findOne({ login: login });
        const tokenGuest = generateAccessToken(userGuest._id, roleGuest.value);

        const user = new Guest({
          login,
          role: roleGuest.value,
          status: "online",
          date: `${day}-${month}-${year} ${reditTime}`,
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
        date: `${day}-${month}-${year} ${reditTime}`,
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
      const guests = await Guest.find();

      const arrayUser = [];
      const arrayGuest = [];

      users.forEach((el) => {
        arrayUser.push({
          username: el.username,
          status: el.status,
          phone: el.phone,
          user: el.role === "User" ? 1 : 2,
          user_id: el._id,
          date: el.date,
        });
      });

      guests.forEach((el) => {
        arrayGuest.push({
          username: el.username,
          status: el.status,
          user: 0,
          user_id: el._id,
          date: el.date,
        });
      });

      res.json({ result: 0, description: "OK", list: [...arrayUser, ...arrayGuest] });
    } catch (e) {
      console.log(e);
    }
  }

  async online(req, res) {
    try {
      const { mac, id_user } = req.body;
      const hasMac = await Macs.findOne({ mac: mac });

      const date = new Date();
      const year = date.getFullYear();
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const reditTime = date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      let user = await User.findOne({ _id: id_user });

      if (!user) {
        user = await Guest.findOne({ _id: id_user });
      }

      if (hasMac) {
        await user.updateOne({
          status: hasMac.confirm == 1 ? "alert" : "online",
          date: `${day}-${month}-${year} ${reditTime}`,
        });

        return res.json({ result: 0, description: "OK" });
      }

      await user.updateOne({
        status: "offline",
        date: `${day}-${month}-${year} ${reditTime}`,
      });
      return res.json({ result: 3, description: "Не авторизован" });
    } catch (e) {
      console.log(e);
      return res.json({ description: "Не авторизован" });
    }
  }

  async logout(req, res) {
    try {
      const token = req.headers.authorization.split(" ")[1];
      const user = jwt.verify(token, secret);

      const date = new Date();
      const year = date.getFullYear();
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const reditTime = date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      if (!user) {
        return res.json({ result: 3, description: "Не авторизован" });
      }

      let userInfo = await User.findOne({ id: user._id });

      if (!userInfo) {
        userInfo = await Guest.findOne({ id: user._id });
      }

      if (!userInfo) {
        return res.json({ result: 3, description: "Не авторизован" });
      }

      await userInfo.updateOne({
        status: "offline",
        date: `${day}-${month}-${year} ${reditTime}`,
      });

      return res.json({ result: 0, description: "OK" });
    } catch (e) {
      console.log(e);
      return res.status(400).json({ description: "Не авторизован" });
    }
  }
}

module.exports = new authController();
