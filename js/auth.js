import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCcNUdDajjThHBkJJHSmI_gGayVpI8gcMM",
  authDomain: "receitasdavo-46eff.firebaseapp.com",
  projectId: "receitasdavo-46eff",
  storageBucket: "receitasdavo-46eff.firebasestorage.app",
  messagingSenderId: "348920861238",
  appId: "1:348920861238:web:6ce6c90811df73f661be97",
  measurementId: "G-Y34F7F92HP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Estado de autenticação global e token atual
export let currentUser = null;
export let currentToken = null;

/**
 * Cadastra um novo usuário
 */
export async function register(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Faz login de um usuário existente
 */
export async function login(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Desloga o usuário
 */
export async function logout() {
  await signOut(auth);
}

/**
 * Retorna o token atual ou busca um novo se estiver expirado
 */
export async function getAuthToken() {
  if (!auth.currentUser) return null;
  return await auth.currentUser.getIdToken();
}

/**
 * Listener de mudança de estado de autenticação
 * @param {Function} callback - Função chamada sempre que o usuário loga ou desloga
 */
export function onAuthChange(callback) {
  onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    if (user) {
      currentToken = await user.getIdToken();
    } else {
      currentToken = null;
    }
    callback(user);
  });
}
