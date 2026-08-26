require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const BookSchema = new mongoose.Schema({ status: String }, { strict: false });
  const Book = mongoose.model('Book', BookSchema);
  
  const result = await Book.updateMany({ status: 'pending' }, { $set: { status: 'draft' } });
  console.log('Update result:', result);
  
  process.exit(0);
}).catch(console.error);
