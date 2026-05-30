import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA2zwIJSWLR79cxa1sGNbLSHjkKjg2dK9o",
  authDomain: "herbalist-cat-garden.firebaseapp.com",
  projectId: "herbalist-cat-garden",
  storageBucket: "herbalist-cat-garden.firebasestorage.app",
  messagingSenderId: "198523032684",
  appId: "1:198523032684:web:1fd56d915b00ba316ef449"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 전역으로 노출
window._fbAuth = auth;
window._fbDb  = db;
window._fbFns = {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  sendPasswordResetEmail,
  doc, setDoc, getDoc, collection, getDocs
};

// 로그인 상태 감지
onAuthStateChanged(auth, function(user){
  window._fbUser = user;
  if(user){
    console.log('Firebase: logged in as', user.email);
    // 이름 복구
    if(G&&(!G.charName||G.charName==='')){
      const nick=user.email.replace('@herbalist.garden','').replace(/@.*$/,'');
      G.playerName=nick; G.charName=nick;
      updateTitle();
    }
  }
});
