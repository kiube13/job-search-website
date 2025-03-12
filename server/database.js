const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./jobs.db'); // Cơ sở dữ liệu trong RAM

db.serialize(() => {
  // Tạo bảng Users
  db.run(`
    CREATE TABLE Users (
      userID INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password TEXT,
      role TEXT
    )
  `);

  // Tạo bảng JobPostings
  db.run(`
    CREATE TABLE JobPostings (
      jobID INTEGER PRIMARY KEY AUTOINCREMENT,
      employerID INTEGER,
      title TEXT,
      description TEXT,
      salary TEXT,
      location TEXT,
      status TEXT,
      FOREIGN KEY (employerID) REFERENCES Users(userID)
    )
  `);

  // Thêm dữ liệu mẫu
  db.run(`
    INSERT INTO JobPostings (employerID, title, description, salary, location, status)
    VALUES (1, 'Lập trình viên Java', 'Phát triển ứng dụng web', '15-20 triệu', 'Hà Nội', 'approved'),
           (1, 'Nhân viên kinh doanh', 'Tìm kiếm khách hàng', '10-15 triệu', 'TP.HCM', 'approved')
  `);
});

module.exports = db; // Xuất db để dùng trong các file khác