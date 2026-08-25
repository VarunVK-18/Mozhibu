require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const User = require('./src/models/User');
  
  const users = await User.find({}, 'username avatar').lean();
  console.log('Users and avatars:');
  users.forEach(u => console.log(`${u.username}: ${u.avatar}`));
  
  process.exit(0);
}).catch(console.error);
