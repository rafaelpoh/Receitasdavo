const { db } = require('../_utils/firebase');

module.exports = async (req, res) => {
  const { method } = req;
  
  try {
    if (method === 'GET') {
      const { bookId } = req.query;

      if (!bookId) {
        return res.status(400).json({ error: 'Missing bookId parameter.' });
      }

      // We retrieve recipes sorted by creation date (newest first) to display the most 
      // recently added recipes at the top of the user's dashboard
      const snapshot = await db.collection('recipes')
        .where('bookId', '==', bookId)
        .get();

      const recipes = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        recipes.push({
          _id: doc.id,
          ...data,
          createdAt: data.createdAt ? data.createdAt.toDate() : null,
          updatedAt: data.updatedAt ? data.updatedAt.toDate() : null
        });
      });

      // Ordenar em memória (mais recentes primeiro) para evitar requisitos de índice composto
      recipes.sort((a, b) => {
        const tA = a.createdAt ? a.createdAt.getTime() : 0;
        const tB = b.createdAt ? b.createdAt.getTime() : 0;
        return tB - tA;
      });

      return res.status(200).json(recipes);
      
    } else if (method === 'POST') {
      const { bookId, title, category, ingredients, preparation, imageUrl } = req.body;

      if (!bookId || !title || !ingredients || !preparation) {
        return res.status(400).json({ error: 'Missing required recipe fields.' });
      }

      // We ensure the bookId exists in the books collection to maintain relational integrity
      // and prevent orphan recipes created by manually manipulated client states
      const bookDoc = await db.collection('books').doc(bookId).get();
      if (!bookDoc.exists) {
        return res.status(404).json({ error: 'Recipe book not found.' });
      }

      const newRecipe = {
        bookId,
        title: title.trim(),
        category: category || 'Outros',
        ingredients: Array.isArray(ingredients) ? ingredients.map(i => i.trim()).filter(Boolean) : [],
        preparation: Array.isArray(preparation) ? preparation.map(p => p.trim()).filter(Boolean) : [],
        imageUrl: imageUrl || '',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = db.collection('recipes').doc(); // Auto-generated string ID
      await docRef.set(newRecipe);
      
      return res.status(201).json({ 
        _id: docRef.id,
        ...newRecipe
      });
      
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('Error in recipes endpoint:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
