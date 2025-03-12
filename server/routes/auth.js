const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database');

const SECRET_KEY = 'your-secret-key';

// Middleware kiểm tra token
const authenticate = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ error: 'Chưa đăng nhập' });

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Token không hợp lệ' });
    req.user = decoded;
    next();
  });
};

// Đăng ký
router.post('/register', (req, res) => {
  const { email, password, role } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 8);

  db.run(
    `INSERT INTO Users (email, password, role) VALUES (?, ?, ?)`,
    [email, hashedPassword, role],
    function (err) {
      if (err) return res.status(400).json({ error: 'Email đã tồn tại' });
      res.status(201).json({ message: 'Đăng ký thành công', userID: this.lastID });
    }
  );
});

// Đăng nhập
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.get(`SELECT * FROM Users WHERE email = ?`, [email], (err, user) => {
    if (err || !user) return res.status(404).json({ error: 'Email không tồn tại' });

    const isValid = bcrypt.compareSync(password, user.password);
    if (!isValid) return res.status(401).json({ error: 'Mật khẩu sai' });

    const token = jwt.sign({ userID: user.userID, role: user.role }, SECRET_KEY, {
      expiresIn: '1h',
    });
    res.json({ message: 'Đăng nhập thành công', token });
  });
});

// Lấy thông tin người dùng
router.get('/me', authenticate, (req, res) => {
  db.get(`SELECT email, role FROM Users WHERE userID = ?`, [req.user.userID], (err, user) => {
    if (err || !user) return res.status(404).json({ error: 'Không tìm thấy' });
    res.json(user);
  });
});

module.exports = router;