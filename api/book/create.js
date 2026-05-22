const { db } = require('../_utils/firebase');
const crypto = require('crypto');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    // We use crypto.randomUUID() which is native in Node.js 16+ to avoid external dependencies
    const bookId = crypto.randomUUID();
    
    // We save the book registration in the database to establish its existence 
    // and track active recipe books over time.
    // In Firestore, we set the document with the book ID.
    await db.collection('books').doc(bookId).set({
      createdAt: new Date()
    });

    return res.status(201).json({ bookId });
  } catch (error) {
    console.error('Error creating book:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
