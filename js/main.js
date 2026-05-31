import { el, delegateEvent, showToast } from './utils.js';
import { onAuthChange, login, register, logout, getAuthToken, currentUser } from './auth.js';

// Application State
const state = {
  bookId: localStorage.getItem('recipe_book_id') || null,
  recipes: [],
  activeView: 'list', // 'list' | 'detail'
  activeRecipeId: null,
  uploadedImageUrl: ''
};

// DOM Cache
const mainContent = document.getElementById('main-content');
const recipeDialog = document.getElementById('recipe-dialog');
const recipeForm = document.getElementById('recipe-form');
const dialogTitle = document.getElementById('dialog-title');
const btnNewRecipe = document.getElementById('btn-new-recipe');
const inputImage = document.getElementById('recipe-image-input');
const imagePreview = document.getElementById('image-preview');
const imageUploadPlaceholder = document.getElementById('image-upload-placeholder');
const btnImportJarvis = document.getElementById('btn-import-jarvis');
const inputImportSource = document.getElementById('import-source');

// Auth DOM Cache
const authDialog = document.getElementById('auth-dialog');
const authForm = document.getElementById('auth-form');
const btnLogin = document.getElementById('btn-login');
const btnLogout = document.getElementById('btn-logout');
const btnToggleAuthMode = document.getElementById('btn-toggle-auth-mode');
const authDialogTitle = document.getElementById('auth-dialog-title');
const btnSubmitAuth = document.getElementById('btn-submit-auth');
let isLoginMode = true;

/**
 * Neutral function for backward compatibility. Returns the URL unmodified
 * since the image is already optimized during client-side canvas resizing.
 */
function optimizeCloudinaryUrl(url) {
  return url;
}

/**
 * Initializes the anonymous book session on first-time load.
 * Hits api/book/create and stores the bookId in localStorage.
 */
async function initializeBook() {
  if (state.bookId) {
    console.log('Using existing recipe book ID:', state.bookId);
    return;
  }

  showToast('Criando seu Livro de Receitas...', 'info');
  try {
    const res = await fetch('/api/book/create', { method: 'POST' });
    if (!res.ok) throw new Error('API initialization failed');
    
    const data = await res.json();
    state.bookId = data.bookId;
    localStorage.setItem('recipe_book_id', state.bookId);
    showToast('Livro de receitas criado com sucesso!', 'success');
  } catch (error) {
    console.error('Initialization error:', error);
    showToast('Erro ao inicializar o livro na nuvem. Suas receitas serão mantidas localmente até a conexão ser reestabelecida.', 'error');
  }
}

/**
 * Fetch recipes associated with the active book from MongoDB Atlas (now generic API).
 */
async function fetchRecipes() {
  if (!state.bookId) return;

  try {
    const res = await fetch(`/api/recipes?bookId=${state.bookId}`);
    if (!res.ok) throw new Error('Failed to load recipes');
    state.recipes = await res.json();
  } catch (error) {
    console.error('Fetch recipes error:', error);
    showToast('Não foi possível carregar as receitas da nuvem.', 'warning');
  }
}

/**
 * Handles the Authentication modal display
 */
function openAuthDialog() {
  authForm.reset();
  isLoginMode = true;
  updateAuthModeUI();
  authDialog.showModal();
}

function updateAuthModeUI() {
  if (isLoginMode) {
    authDialogTitle.textContent = 'Entrar';
    btnSubmitAuth.textContent = 'Entrar';
    btnToggleAuthMode.textContent = 'Criar uma conta';
  } else {
    authDialogTitle.textContent = 'Nova Conta';
    btnSubmitAuth.textContent = 'Criar Conta';
    btnToggleAuthMode.textContent = 'Já tenho uma conta';
  }
}

async function handleAuthSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('auth-email').value;
  const password = document.getElementById('auth-password').value;
  
  if (!email || !password) {
    return showToast('Preencha email e senha', 'warning');
  }

  showToast('Autenticando...', 'info');
  btnSubmitAuth.disabled = true;

  try {
    if (isLoginMode) {
      await login(email, password);
      showToast('Bem-vindo de volta!', 'success');
    } else {
      await register(email, password);
      showToast('Conta criada com sucesso!', 'success');
    }
    authDialog.close();
  } catch (err) {
    console.error(err);
    showToast('Erro: ' + err.message, 'error');
  } finally {
    btnSubmitAuth.disabled = false;
  }
}


/**
 * Resizes a file image on the client side using HTML5 Canvas
 * down to a maximum of 800px width/height to save network bandwidth and storage size.
 * Returns a Promise resolving to an object with the base64 data and contentType.
 */
function resizeImageWithCanvas(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new Image();
      img.onload = function () {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert the resized image to a data URL (JPEG at 80% quality)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        const base64Data = dataUrl.split(',')[1];
        resolve({ base64: base64Data, contentType: 'image/jpeg', dataUrl });
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Handles the secure upload of local images to Firebase Storage.
 * Uses client-side Canvas to resize the image before posting the base64 payload to the backend.
 */
async function handleImageUpload(file) {
  if (!file) return;

  showToast('Otimizando imagem...', 'info');
  try {
    // 1. Resize and compress using Canvas on the client side
    const { dataUrl } = await resizeImageWithCanvas(file);

    // 2. Save and preview optimized local dataUrl directly without Storage
    state.uploadedImageUrl = dataUrl;
    imagePreview.src = state.uploadedImageUrl;
    imagePreview.classList.remove('image-upload-hidden');
    imageUploadPlaceholder.classList.add('image-upload-hidden');
    showToast('Imagem otimizada com sucesso!', 'success');
  } catch (error) {
    console.error('Processing error:', error);
    showToast('Ocorreu um erro no processamento da imagem.', 'error');
  }
}

/**
 * Imports and structures raw URL/text via Gemini AI.
 * Sets the form fields directly for user preview and adjustment.
 */
async function handleGeminiImport() {
  const query = inputImportSource.value.trim();
  if (!query) {
    showToast('Insira uma URL ou ingredientes brutos.', 'warning');
    return;
  }

  btnImportJarvis.disabled = true;
  btnImportJarvis.textContent = 'Interpretando...';
  showToast('Jarvis está lendo e estruturando a receita...', 'info');

  try {
    const isUrl = query.startsWith('http://') || query.startsWith('https://');
    const payload = isUrl ? { url: query } : { text: query };

    const res = await fetch('/api/parser/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Gemini processing failed');
    }

    const recipeData = await res.json();

    // Populate form fields with the AI structured response
    document.getElementById('recipe-title').value = recipeData.titulo || '';
    document.getElementById('recipe-category').value = recipeData.categoria || 'Outros';
    
    if (Array.isArray(recipeData.ingredientes)) {
      document.getElementById('recipe-ingredients').value = recipeData.ingredientes.join('\n');
    }
    if (Array.isArray(recipeData.modo_preparo)) {
      document.getElementById('recipe-preparation').value = recipeData.modo_preparo.join('\n');
    }

    showToast('Receita importada com sucesso! Ajuste os detalhes abaixo.', 'success');
    inputImportSource.value = ''; // Clean importer bar
  } catch (error) {
    console.error('Gemini import error:', error);
    showToast(error.message || 'Erro ao processar com Jarvis.', 'error');
  } finally {
    btnImportJarvis.disabled = false;
    btnImportJarvis.textContent = 'Importar com Jarvis';
  }
}

/**
 * Saves a new or edited recipe to the MongoDB Atlas cluster.
 */
async function handleFormSubmit(e) {
  e.preventDefault();
  
  const title = document.getElementById('recipe-title').value.trim();
  const category = document.getElementById('recipe-category').value;
  const ingredientsRaw = document.getElementById('recipe-ingredients').value;
  const preparationRaw = document.getElementById('recipe-preparation').value;

  if (!title || !ingredientsRaw || !preparationRaw) {
    showToast('Preencha os campos obrigatórios.', 'warning');
    return;
  }

  // Parse lines into arrays
  const ingredients = ingredientsRaw.split('\n').map(i => i.trim()).filter(Boolean);
  const preparation = preparationRaw.split('\n').map(p => p.trim()).filter(Boolean);

  const payload = {
    bookId: state.bookId,
    title,
    category,
    ingredients,
    preparation,
    imageUrl: state.uploadedImageUrl
  };

  const isEditing = !!state.activeRecipeId;
  const url = isEditing ? `/api/recipes/detail?id=${state.activeRecipeId}` : '/api/recipes';
  const method = isEditing ? 'PUT' : 'POST';

  showToast('Salvando receita...', 'info');

  try {
    const token = await getAuthToken();
    if (!token) throw new Error('Você precisa estar logado para salvar.');

    const res = await fetch(url, {
      method,
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error('Failed to save recipe.');

    const savedRecipe = await res.json();
    showToast('Receita salva na nuvem!', 'success');
    
    // Close modal, reload datasets and route view
    recipeDialog.close();
    await fetchRecipes();

    if (isEditing) {
      setView('detail', state.activeRecipeId);
    } else {
      setView('list');
    }
  } catch (error) {
    console.error('Save error:', error);
    showToast('Ocorreu um erro ao salvar a receita.', 'error');
  }
}

/**
 * Handles recipe deletion with verification and authorization checks.
 */
async function handleDeleteRecipe(id) {
  if (!confirm('Deseja realmente excluir esta receita de forma permanente?')) return;

  showToast('Excluindo receita...', 'info');
  try {
    const token = await getAuthToken();
    if (!token) throw new Error('Acesso negado.');

    const res = await fetch(`/api/recipes/detail?id=${id}`, {
      method: 'DELETE',
      headers: { 
        'x-book-id': state.bookId,
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) throw new Error('Authorization or API error during delete.');

    showToast('Receita excluída com sucesso.', 'success');
    await fetchRecipes();
    setView('list');
  } catch (error) {
    console.error('Delete error:', error);
    showToast('Erro ao excluir a receita do acervo.', 'error');
  }
}

/**
 * Shares the recipe by copying a unique serverless link to the clipboard.
 */
async function handleShareRecipe(id) {
  const shareUrl = `${window.location.origin}/share.html?id=${id}`;
  try {
    await navigator.clipboard.writeText(shareUrl);
    showToast('Link de compartilhamento copiado! Compartilhe no WhatsApp.', 'success');
  } catch (err) {
    console.error('Clipboard error:', err);
    showToast(`Copie o link manualmente: ${shareUrl}`, 'info', 8000);
  }
}

/**
 * Renders the dashboard showing all recipes.
 */
function renderListView() {
  mainContent.textContent = ''; // Avoid innerHTML

  if (state.recipes.length === 0) {
    const emptyState = el('div', { class: 'empty-state' },
      el('h3', {}, 'Nenhuma receita por aqui...'),
      el('p', {}, 'Que tal começar importando uma receita de qualquer link com a IA do Jarvis?'),
      el('button', { 
        class: 'btn btn-primary', 
        onclick: () => openRecipeDialog() 
      }, '+ Adicionar Receita')
    );
    mainContent.appendChild(emptyState);
    return;
  }

  const cardsContainer = el('div', { class: 'grid-cards' });
  
  state.recipes.forEach(recipe => {
    // Generate card layout dynamically using el() to avoid innerHTML
    const cardImg = recipe.imageUrl
      ? el('img', { src: recipe.imageUrl, class: 'recipe-card-img', alt: recipe.title, loading: 'lazy' })
      : el('div', { class: 'recipe-card-img-placeholder' }, el('em', {}, recipe.title[0]));

    const formattedDate = new Date(recipe.createdAt).toLocaleDateString('pt-BR');

    const card = el('article', { 
      class: 'recipe-card', 
      dataset: { id: recipe._id } 
    },
      cardImg,
      el('div', { class: 'recipe-card-content' },
        el('span', { class: 'recipe-card-category' }, recipe.category),
        el('h3', { class: 'recipe-card-title' }, recipe.title),
        el('span', { class: 'recipe-card-meta' }, `Salva em ${formattedDate}`)
      )
    );

    cardsContainer.appendChild(card);
  });

  mainContent.appendChild(cardsContainer);
}

/**
 * Renders the detailed view of a single recipe ("modo revista").
 */
function renderDetailView(id) {
  mainContent.textContent = ''; // Clean workspace
  
  const recipe = state.recipes.find(r => r._id === id);
  if (!recipe) {
    showToast('Receita não encontrada.', 'error');
    setView('list');
    return;
  }

  // Create action bar header
  const isOwner = recipe.userId && currentUser && recipe.userId === currentUser.uid;
  
  const actionsGroup = [
    el('button', { class: 'btn btn-secondary', onclick: () => handleShareRecipe(recipe._id) }, 'Compartilhar')
  ];

  if (isOwner) {
    actionsGroup.push(el('button', { class: 'btn btn-secondary', onclick: () => openRecipeDialog(recipe) }, 'Editar'));
    actionsGroup.push(el('button', { class: 'btn btn-danger', onclick: () => handleDeleteRecipe(recipe._id) }, 'Excluir'));
  }

  const actionsBar = el('div', { class: 'details-actions' },
    el('button', { class: 'btn btn-secondary btn-text', onclick: () => setView('list') }, '← Voltar para o acervo'),
    el('div', { class: 'details-actions-group' }, ...actionsGroup)
  );

  // Magazine layout headers
  const magazineHeader = el('div', { class: 'magazine-header' },
    el('div', { class: 'magazine-meta' },
      el('span', { class: 'magazine-meta-item' }, 'Categoria: ', el('strong', {}, recipe.category))
    ),
    el('h1', { class: 'magazine-title' }, recipe.title)
  );

  // Hero Image element
  const heroImage = recipe.imageUrl
    ? el('img', { class: 'magazine-hero-image', src: recipe.imageUrl, alt: recipe.title })
    : null;

  // Render list of ingredients with responsive checkboxes
  const ingredientsItems = recipe.ingredients.map((ing, idx) => 
    el('li', {},
      el('input', { type: 'checkbox', class: 'ingredient-checkbox', id: `ing-check-${idx}` }),
      el('span', {}, ing)
    )
  );
  
  // Render ordered preparation steps
  const preparationItems = recipe.preparation.map(step => 
    el('li', {},
      el('p', {}, step)
    )
  );

  // Construct magazine columns structure
  const magazineBody = el('div', { class: 'magazine-body' },
    el('section', { class: 'ingredients-column' },
      el('h2', { class: 'magazine-section-title' }, 'Ingredientes'),
      el('ul', { class: 'ingredients-list' }, ...ingredientsItems)
    ),
    el('section', { class: 'preparation-column' },
      el('h2', { class: 'magazine-section-title' }, 'Modo de Preparo'),
      el('ol', { class: 'preparation-steps' }, ...preparationItems)
    )
  );

  // Append nodes to workspace
  const article = el('article', { class: 'magazine-view' },
    actionsBar,
    magazineHeader,
    heroImage,
    magazineBody
  );

  mainContent.appendChild(article);
}

/**
 * Router dispatcher that controls screen switching.
 */
export function setView(view, extra = null) {
  state.activeView = view;
  if (view === 'list') {
    state.activeRecipeId = null;
    renderListView();
  } else if (view === 'detail') {
    state.activeRecipeId = extra;
    renderDetailView(extra);
  }
}

/**
 * Opens the recipe form dialog. Pre-fills fields if editing.
 */
function openRecipeDialog(recipe = null) {
  recipeForm.reset();
  
  if (recipe) {
    state.activeRecipeId = recipe._id;
    dialogTitle.textContent = 'Editar Receita';
    
    document.getElementById('recipe-title').value = recipe.title;
    document.getElementById('recipe-category').value = recipe.category;
    document.getElementById('recipe-ingredients').value = recipe.ingredients.join('\n');
    document.getElementById('recipe-preparation').value = recipe.preparation.join('\n');
    
    if (recipe.imageUrl) {
      state.uploadedImageUrl = recipe.imageUrl;
      imagePreview.src = recipe.imageUrl;
      imagePreview.classList.remove('image-upload-hidden');
      imageUploadPlaceholder.classList.add('image-upload-hidden');
    } else {
      state.uploadedImageUrl = '';
      imagePreview.classList.add('image-upload-hidden');
      imageUploadPlaceholder.classList.remove('image-upload-hidden');
    }
  } else {
    state.activeRecipeId = null;
    dialogTitle.textContent = 'Nova Receita';
    state.uploadedImageUrl = '';
    imagePreview.classList.add('image-upload-hidden');
    imageUploadPlaceholder.classList.remove('image-upload-hidden');
  }
  
  recipeDialog.showModal();
}

// Event Bindings
btnNewRecipe.addEventListener('click', () => openRecipeDialog());

// Modal Close logic
document.querySelectorAll('[data-action="close-dialog"]').forEach(btn => {
  btn.addEventListener('click', () => recipeDialog.close());
});

// Submit form
recipeForm.addEventListener('submit', handleFormSubmit);

// Custom upload area trigger
document.getElementById('image-upload-area').addEventListener('click', () => {
  inputImage.click();
});

// File input handler
inputImage.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) handleImageUpload(file);
});

// Gemini AI parser submit trigger
btnImportJarvis.addEventListener('click', handleGeminiImport);

// Event delegation on the main content area (Required by performance rules)
// Handles card clicks to navigate to the detailed recipe page
delegateEvent(mainContent, '.recipe-card', 'click', (event, card) => {
  const recipeId = card.dataset.id;
  setView('detail', recipeId);
});

// Delegation for ingredient checkbox style toggles in active reader view
delegateEvent(mainContent, '.ingredient-checkbox', 'change', (event, checkbox) => {
  const labelText = checkbox.nextElementSibling;
  if (labelText) {
    if (checkbox.checked) {
      labelText.style.textDecoration = 'line-through';
      labelText.style.opacity = '0.5';
    } else {
      labelText.style.textDecoration = 'none';
      labelText.style.opacity = '1';
    }
  }
});

// Auth Modal Close logic
document.querySelectorAll('[data-action="close-auth"]').forEach(btn => {
  btn.addEventListener('click', () => authDialog.close());
});

// Auth Mode toggle
btnToggleAuthMode.addEventListener('click', () => {
  isLoginMode = !isLoginMode;
  updateAuthModeUI();
});

// Auth Events
btnLogin.addEventListener('click', openAuthDialog);
btnLogout.addEventListener('click', () => {
  logout();
  showToast('Você saiu com sucesso.', 'info');
});
authForm.addEventListener('submit', handleAuthSubmit);

// Run Initializer on script loading
(async function init() {
  await initializeBook();
  
  // Auth state listener
  onAuthChange(async (user) => {
    if (user) {
      btnLogin.style.display = 'none';
      btnLogout.style.display = 'inline-flex';
      btnNewRecipe.style.display = 'inline-flex';
    } else {
      btnLogin.style.display = 'inline-flex';
      btnLogout.style.display = 'none';
      btnNewRecipe.style.display = 'none';
    }
    // Refresh view to apply permissions (e.g. edit/delete buttons)
    if (state.activeView === 'detail') {
      renderDetailView(state.activeRecipeId);
    }
  });

  await fetchRecipes();
  setView('list');
})();

