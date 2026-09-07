require('dotenv').config({path: './.env'});
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const User = require('./src/models/User');
  const UserSubscription = require('./src/models/UserSubscription');
  const subs = await UserSubscription.find({ status: 'active', endDate: { $gte: new Date() } });
  console.log('Active subs found:', subs.length);
  for (let sub of subs) {
    await User.updateOne({ _id: sub.user }, { isPremium: true });
  }
  console.log('Synced premium users');
  process.exit(0);
}).catch(console.error);
