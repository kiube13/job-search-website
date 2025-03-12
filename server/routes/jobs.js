const express = require('express');
const router = express.Router();
const db = require('../database');
const jwt = require('jsonwebtoken');

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

// Đăng tin tuyển dụng
router.post('/post', authenticate, (req, res) => {
  const { title, description, salary, location } = req.body;
  if (req.user.role !== 'employer') return res.status(403).json({ error: 'Không có quyền' });

  db.run(
    `INSERT INTO JobPostings (employerID, title, description, salary, location, status) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [req.user.userID, title, description, salary, location, 'pending'],
    function (err) {
      if (err) return res.status(500).json({ error: 'Lỗi server' });
      res.status(201).json({ message: 'Đăng tin thành công', jobID: this.lastID });
    }
  );
});

// Tìm kiếm việc làm
router.get('/search', (req, res) => {
  const { keyword, location } = req.query;
  let query = `SELECT * FROM JobPostings WHERE status = 'approved'`;
  const params = [];

  if (keyword) {
    query += ` AND title LIKE ?`;
    params.push(`%${keyword}%`);
  }
  if (location) {
    query += ` AND location LIKE ?`;
    params.push(`%${location}%`);
  }

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Lỗi server' });
    res.json(rows);
  });
});


router.post('/apply/:jobID', authenticate, (req, res) => {
  const jobID = req.params.jobID;
  const applicantID = req.user.userID;
  db.run(
    `INSERT INTO Applications (jobID, applicantID, status) VALUES (?, ?, ?)`,
    [jobID, applicantID, 'submitted'],
    function (err) {
      if (err) return res.status(500).json({ error: 'Lỗi server' });
      res.status(201).json({ message: 'Ứng tuyển thành công' });
    }
  );
});

module.exports = router;