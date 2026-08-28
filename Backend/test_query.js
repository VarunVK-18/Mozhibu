const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const query = { _id: { $ne: '6a7ab0a0ba927dbe08df27e2' } };
  const audience = 'writers';
  if (audience === 'readers') {
    query.role = 'reader';
  } else if (audience === 'writers') {
    query.role = { $in: ['writer', 'superadmin'] };
  }
  const users = await User.find(query).select('role');
  console.log(users.map(u => u.role));
  mongoose.disconnect();
});
