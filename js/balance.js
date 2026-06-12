import { getBalance, changeBalance } from "./firebase.js";

const balanceText = document.getElementById("balanceAmount");
const amountInput = document.getElementById("amountInput");
const addBtn = document.getElementById("addBtn");
const removeBtn = document.getElementById("removeBtn");

async function loadBalance() {
    const balance = await getBalance();
    balanceText.textContent = `RM ${balance.toFixed(2)}`;
}

async function addMoney() {
    const amount = parseFloat(amountInput.value);

    if (isNaN(amount)) return;

    await changeBalance(amount);

    amountInput.value = "";
    loadBalance();
}

async function removeMoney() {
    const amount = parseFloat(amountInput.value);

    if (isNaN(amount)) return;

    await changeBalance(-amount);

    amountInput.value = "";
    loadBalance();
}

addBtn.addEventListener("click", addMoney);
removeBtn.addEventListener("click", removeMoney);

loadBalance();