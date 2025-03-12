// Kiểm tra trạng thái đăng nhập khi tải trang
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  const navItems = document.getElementById('navItems');
  if (token) {
    fetch('/api/auth/me', {
      headers: { 'Authorization': token }
    })
      .then(response => response.json())
      .then(data => {
        if (data.email) {
          navItems.innerHTML = `
            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown">
                Xin chào, ${data.email}
              </a>
              <ul class="dropdown-menu dropdown-menu-end">
                <li><a class="dropdown-item" href="#" onclick="logout()">Đăng xuất</a></li>
              </ul>
            </li>
          `;
        }
      })
      .catch(() => localStorage.removeItem('token'));
  }
});

function searchJobs() {
  const keyword = document.getElementById('keyword').value;
  const location = document.getElementById('location').value;

  fetch(`/api/jobs/search?keyword=${keyword}&location=${location}`)
    .then(response => response.json())
    .then(jobs => {
      const jobList = document.getElementById('jobList');
      jobList.innerHTML = '';
      jobs.forEach(job => {
        const col = document.createElement('div');
        col.className = 'col-md-4 mb-4 animate__animated animate__fadeInUp';
        col.innerHTML = `
          <div class="card job-card shadow-sm">
            <div class="card-body">
              <h5 class="card-title">${job.title}</h5>
              <p class="card-text text-muted">${job.description}</p>
              <p class="card-text"><i class="fas fa-money-bill-wave text-success"></i> ${job.salary}</p>
              <p class="card-text"><i class="fas fa-map-marker-alt text-danger"></i> ${job.location}</p>
              <button class="btn btn-outline-primary btn-sm" onclick="applyJob(${job.jobID})">Ứng tuyển</button>
            </div>
          </div>
        `;
        jobList.appendChild(col);
      });
    })
    .catch(err => showToast('Lỗi khi tìm kiếm!', 'error'));
}

// Xử lý form đăng ký
document.getElementById('registerForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  const role = document.getElementById('registerRole').value;

  fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role })
  })
    .then(response => response.json())
    .then(data => {
      showToast(data.message, data.userID ? 'success' : 'error');
      if (data.userID) {
        bootstrap.Modal.getInstance(document.getElementById('registerModal')).hide();
      }
    })
    .catch(err => showToast('Lỗi server!', 'error'));
});

// Xử lý form đăng nhập
document.getElementById('loginForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
    .then(response => response.json())
    .then(data => {
      if (data.token) {
        localStorage.setItem('token', data.token);
        showToast(data.message, 'success');
        bootstrap.Modal.getInstance(document.getElementById('loginModal')).hide();
        location.reload(); // Tải lại trang để cập nhật navbar
      } else {
        showToast(data.error, 'error');
      }
    })
    .catch(err => showToast('Lỗi server!', 'error'));
});

// Ứng tuyển
function applyJob(jobID) {
  const token = localStorage.getItem('token');
  if (!token) {
    showToast('Vui lòng đăng nhập để ứng tuyển!', 'warning');
    return;
  }
  showToast(`Đã gửi đơn ứng tuyển cho công việc ID: ${jobID}`, 'success');
}

// Đăng xuất
function logout() {
  localStorage.removeItem('token');
  showToast('Đã đăng xuất!', 'success');
  location.reload();
}

// Hàm hiển thị toast
function showToast(message, type = 'success') {
  const bgColor = type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#ffc107';
  Toastify({
    text: message,
    duration: 3000,
    close: true,
    gravity: 'top',
    position: 'right',
    backgroundColor: bgColor,
  }).showToast();
}

//ham sreach
function searchJobs() {
  const keyword = document.getElementById('keyword').value;
  const location = document.getElementById('location').value;
  console.log('Searching:', keyword, location);
  fetch(`/api/jobs/search?keyword=${keyword}&location=${location}`)
    .then(response => response.json())
    .then(jobs => {
      console.log('Jobs received:', jobs);
      const jobList = document.getElementById('jobList');
      jobList.innerHTML = '';
      jobs.forEach(job => {
        const col = document.createElement('div');
        col.className = 'col-md-4 mb-4 animate__animated animate__fadeInUp';
        col.innerHTML = `
          <div class="card job-card shadow-sm">
            <div class="card-body">
              <h5 class="card-title">${job.title}</h5>
              <p class="card-text text-muted">${job.description}</p>
              <p class="card-text"><i class="fas fa-money-bill-wave text-success"></i> ${job.salary}</p>
              <p class="card-text"><i class="fas fa-map-marker-alt text-danger"></i> ${job.location}</p>
              <button class="btn btn-outline-primary btn-sm" onclick="applyJob(${job.jobID})">Ứng tuyển</button>
            </div>
          </div>
        `;
        jobList.appendChild(col);
      });
    })
    .catch(err => {
      console.error('Error:', err);
      showToast('Lỗi khi tìm kiếm!', 'error');
    });
}