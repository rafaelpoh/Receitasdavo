const { db } = require('./_utils/firebase');
const fs = require('fs');
const path = require('path');

function escapeHtml(unsafe) {
  if (!unsafe) return '';
  return unsafe
    .toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

module.exports = async (req, res) => {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).send('<h1>Erro: ID da receita não fornecido.</h1><p><a href="/">Voltar para a página inicial</a></p>');
  }

  try {
    const doc = await db.collection('recipes').doc(id).get();

    if (!doc.exists) {
      return res.status(404).send('<h1>Erro: Receita não encontrada.</h1><p><a href="/">Voltar para a página inicial</a></p>');
    }

    const recipe = doc.data();

    // Load the HTML template from the project root using path.join(process.cwd(), ...)
    const templatePath = path.join(process.cwd(), 'share-template.html');
    let html = fs.readFileSync(templatePath, 'utf8');

    // Escaped content definitions
    const escapedTitle = escapeHtml(recipe.title);
    const escapedCategory = escapeHtml(recipe.category);
    
    // Cloudinary dynamic images support cropping and quality out-of-the-box (q_auto, f_auto)
    const ogImage = recipe.imageUrl || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800&auto=format&fit=crop&q=60';
    const ogDesc = `Confira a receita de "${escapedTitle}" (${escapedCategory}) no nosso livro de receitas digital minimalista.`;

    // Render components based on conditions
    let heroImageHtml = '';
    if (recipe.imageUrl) {
      heroImageHtml = `<img class="magazine-hero-image" src="${escapeHtml(recipe.imageUrl)}" alt="${escapedTitle}">`;
    }

    // Form ingredients list
    const ingredientsHtml = recipe.ingredients && recipe.ingredients.length > 0
      ? recipe.ingredients.map((ing, index) => `
          <li>
            <input type="checkbox" class="ingredient-checkbox" id="ing-${index}">
            <span>${escapeHtml(ing)}</span>
          </li>
        `).join('\n')
      : '<li><span>Nenhum ingrediente listado.</span></li>';

    // Form preparation steps
    const preparationHtml = recipe.preparation && recipe.preparation.length > 0
      ? recipe.preparation.map((step) => `
          <li>
            <p>${escapeHtml(step)}</p>
          </li>
        `).join('\n')
      : '<li><p>Nenhum passo de preparo listado.</p></li>';

    // Replace placeholders inside the template
    html = html
      .replace(/\{\{TITLE\}\}/g, escapedTitle)
      .replace(/\{\{OG_TITLE\}\}/g, escapedTitle)
      .replace(/\{\{CATEGORY\}\}/g, escapedCategory)
      .replace(/\{\{OG_DESCRIPTION\}\}/g, escapeHtml(ogDesc))
      .replace(/\{\{OG_IMAGE\}\}/g, escapeHtml(ogImage))
      .replace(/\{\{HERO_IMAGE_HTML\}\}/g, heroImageHtml)
      .replace(/\{\{INGREDIENTS_HTML\}\}/g, ingredientsHtml)
      .replace(/\{\{PREPARATION_HTML\}\}/g, preparationHtml);

    // Return the server-rendered HTML document
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);

  } catch (error) {
    console.error('Error rendering sharing route:', error);
    return res.status(500).send('<h1>Erro Interno do Servidor</h1><p>Não foi possível processar a página de compartilhamento.</p>');
  }
};
