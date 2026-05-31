const { db, verifyAuthToken } = require('../_utils/firebase');

module.exports = async (req, res) => {
  const { method } = req;
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Missing recipe id.' });
  }

  try {
    const docRef = db.collection('recipes').doc(id);

    if (method === 'GET') {
      const doc = await docRef.get();
      if (!doc.exists) {
        return res.status(404).json({ error: 'Recipe not found.' });
      }

      const recipe = doc.data();
      return res.status(200).json({
        _id: doc.id,
        ...recipe,
        createdAt: recipe.createdAt ? recipe.createdAt.toDate() : null,
        updatedAt: recipe.updatedAt ? recipe.updatedAt.toDate() : null
      });

    } else if (method === 'PUT') {
      const { bookId, title, category, ingredients, preparation, imageUrl } = req.body;

      if (!bookId) {
        return res.status(400).json({ error: 'Missing bookId for authorization.' });
      }

      const authUser = await verifyAuthToken(req);
      if (!authUser) {
        return res.status(401).json({ error: 'Unauthorized. Token missing or invalid.' });
      }

      const doc = await docRef.get();
      if (!doc.exists) {
        return res.status(404).json({ error: 'Recipe not found.' });
      }

      const recipe = doc.data();

      // Verify ownership by checking the userId from the token
      if (recipe.userId !== authUser.uid) {
        return res.status(403).json({ error: 'Unauthorized. You do not own this recipe.' });
      }

      const updateData = {
        title: title ? title.trim() : recipe.title,
        category: category || recipe.category,
        ingredients: Array.isArray(ingredients) ? ingredients.map(i => i.trim()).filter(Boolean) : recipe.ingredients,
        preparation: Array.isArray(preparation) ? preparation.map(p => p.trim()).filter(Boolean) : recipe.preparation,
        imageUrl: imageUrl !== undefined ? imageUrl : recipe.imageUrl,
        updatedAt: new Date()
      };

      await docRef.update(updateData);

      return res.status(200).json({
        _id: id,
        ...recipe,
        ...updateData,
        createdAt: recipe.createdAt ? recipe.createdAt.toDate() : null,
        updatedAt: updateData.updatedAt
      });

    } else if (method === 'DELETE') {
      // In DELETE requests, the bookId is sent in headers or query parameters for validation
      const bookId = req.headers['x-book-id'] || req.query.bookId;

      if (!bookId) {
        return res.status(400).json({ error: 'Missing bookId for authorization.' });
      }

      const authUser = await verifyAuthToken(req);
      if (!authUser) {
        return res.status(401).json({ error: 'Unauthorized. Token missing or invalid.' });
      }

      const doc = await docRef.get();
      if (!doc.exists) {
        return res.status(404).json({ error: 'Recipe not found.' });
      }

      const recipe = doc.data();

      // We verify ownership before deleting to maintain data integrity
      if (recipe.userId !== authUser.uid) {
        return res.status(403).json({ error: 'Unauthorized. You do not own this recipe.' });
      }

      await docRef.delete();

      return res.status(200).json({ message: 'Recipe deleted successfully.' });

    } else {
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('Error in recipe details endpoint:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
