const { bucket } = require('../_utils/firebase');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { base64, filename, contentType } = req.body;

    if (!base64 || !filename || !contentType) {
      return res.status(400).json({ error: 'Missing base64, filename, or contentType parameters.' });
    }

    // Convert base64 string to a binary buffer
    const buffer = Buffer.from(base64, 'base64');

    // Sanitize filename to avoid folder structure manipulations
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `recipes/${Date.now()}-${sanitizedFilename}`;

    const file = bucket.file(filePath);

    // Save buffer directly to Firebase Storage bucket and make it publicly accessible
    await file.save(buffer, {
      metadata: {
        contentType: contentType
      },
      public: true
    });

    // Generate public HTTP URL for the uploaded file
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

    return res.status(200).json({ url: publicUrl });

  } catch (error) {
    console.error('Error uploading file to Firebase Storage:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
