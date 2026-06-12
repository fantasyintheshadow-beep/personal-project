import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";

import {
    getFirestore,
    doc,
    getDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDvLji9cHwGnUuaBoRKxHRXSZhpTRF-GD8",
    authDomain: "personal-planner-c07ee.firebaseapp.com",
    projectId: "personal-planner-c07ee",
    storageBucket: "personal-planner-c07ee.firebasestorage.app",
    messagingSenderId: "22496243226",
    appId: "1:22496243226:web:3c2167c2f923db9114eba3",
    measurementId: "G-PZFQNZP0K2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const balanceRef = doc(db, "app", "balance");

export async function getBalance() {
    const snap = await getDoc(balanceRef);
    return snap.data().amount;
}

export async function changeBalance(change) {
    const snap = await getDoc(balanceRef);

    let current = snap.data().amount;
    current += change;

    await updateDoc(balanceRef, {
        amount: current
    });

    return current;
}