import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCCtwtuN-dZ__GKkmXvbAmD_ImbKPRSW5Q",
  authDomain: "budgettrackerapp-2251a.firebaseapp.com",
  projectId: "budgettrackerapp-2251a",
  storageBucket: "budgettrackerapp-2251a.firebasestorage.app",
  messagingSenderId: "690249620824",
  appId: "1:690249620824:web:5a2088bc2f2dbeb068992d"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
