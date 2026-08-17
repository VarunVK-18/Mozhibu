const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testUpload() {
  try {
    const form = new FormData();
    form.append('cover', Buffer.from('fake image data'), { filename: 'cover.jpg', contentType: 'image/jpeg' });
    
    // We need a valid token. Let's create one using the jwt secret.
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ user: { id: '64f1a2b3c4d5e6f7g8h9i0j1', role: 'writer' } }, 'supersecretkey123');

    const res = await axios.post('http://localhost:5000/api/books/cover', form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${token}`
      }
    });
    console.log(res.data);
  } catch (err) {
    console.error('Error:', err.response ? err.response.data : err.message);
  }
}
testUpload();
