const express = require('express');
const cors = require('cors');
const app = express();
const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');

app.use(cors());
app.use(express.json());
app.use(express.static('./public')); // Sửa từ ../public thành ./public

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});