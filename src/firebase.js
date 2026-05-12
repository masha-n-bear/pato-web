import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyB1ck8sBsAjmzmP_h07sUtGt3uCHZM3oaQ',
  authDomain: 'pato-v2.firebaseapp.com',
  projectId: 'pato-v2',
  storageBucket: 'pato-v2.firebasestorage.app',
  messagingSenderId: '243452972314',
  appId: '1:243452972314:web:8ee03f09c8576ed19530a3',
  measurementId: 'G-SM5MM7EF8X',
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
export const db = getFirestore(app)
