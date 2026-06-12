// ======================
// IMPORT FIREBASE
// ======================
import { getBalance, changeBalance } from "./firebase.js";


// ======================
// CLOCK
// ======================
function updateClock() {
    const now = new Date();

    document.getElementById("clock").textContent =
        now.toLocaleTimeString();

    document.getElementById("date").textContent =
        now.toDateString();
}

updateClock();
setInterval(updateClock, 1000);


// ======================
// GOOGLE CALENDAR SETUP
// ======================

const CLIENT_ID = "455587994942-kul6jepdo5tgpdroe3k9j13htk1mef9b.apps.googleusercontent.com";
const SCOPES = "https://www.googleapis.com/auth/calendar.readonly";

let tokenClient;


// Load Google APIs
function gapiLoaded() {
    gapi.load("client", initializeGapiClient);
}

async function initializeGapiClient() {
    await gapi.client.init({
        discoveryDocs: [
            "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"
        ],
    });
}


// Google Identity Services init
function gisLoaded() {

    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,

        callback: (tokenResponse) => {

            if (tokenResponse.error) {
                console.error(tokenResponse);
                return;
            }

            // store token
            gapi.client.setToken(tokenResponse);

            // hide login button safely
            const btn = document.getElementById("loginButton");
            if (btn) btn.style.display = "none";

            listUpcomingEvents();
        },
    });
}


// ======================
// LOGIN BUTTON
// ======================
function handleLogin() {
    tokenClient.requestAccessToken({ prompt: "consent" });
}

window.handleLogin = handleLogin;


// ======================
// GOOGLE CALENDAR EVENTS
// ======================
async function listUpcomingEvents() {

    let response = await gapi.client.calendar.events.list({
        calendarId: "primary",
        timeMin: new Date().toISOString(),
        showDeleted: false,
        singleEvents: true,
        maxResults: 8,
        orderBy: "startTime",
    });

    const events = response.result.items;

    let html = "";

    if (!events || events.length === 0) {
        html = `<p style="color:gray;">No upcoming events</p>`;
    } else {
        events.forEach(event => {

            const title = event.summary || "No Title";
            const time = event.start.dateTime || event.start.date;

            const formattedTime = event.start.dateTime
                ? new Date(event.start.dateTime).toLocaleString()
                : time;

            html += `
                <div class="event-card">
                    <div class="event-title">${title}</div>
                    <div class="event-time">${formattedTime}</div>
                </div>
            `;
        });
    }

    const container = document.getElementById("calendarContent");
    if (container) container.innerHTML = html;
}


// ======================
// BALANCE SYSTEM (FIREBASE)
// ======================

async function loadBalance() {
    const amount = await getBalance();

    const el = document.getElementById("balanceValue");
    if (el) el.textContent = amount.toFixed(2);
}

async function addMoney() {
    const input = parseFloat(document.getElementById("balanceInput").value);

    if (isNaN(input)) return;

    await changeBalance(input);
    loadBalance();
}

async function removeMoney() {
    const input = parseFloat(document.getElementById("balanceInput").value);

    if (isNaN(input)) return;

    await changeBalance(-input);
    loadBalance();
}


// ======================
// STARTUP
// ======================
window.addEventListener("load", () => {

    gapiLoaded();
    gisLoaded();

    // login button (always visible initially)
    document.getElementById("loginButton").innerHTML = `
        <button onclick="handleLogin()">Sign in with Google</button>
    `;

    // balance buttons
    const addBtn = document.getElementById("addBtn");
    const removeBtn = document.getElementById("removeBtn");

    if (addBtn) addBtn.addEventListener("click", addMoney);
    if (removeBtn) removeBtn.addEventListener("click", removeMoney);

    // load balance safely
    loadBalance();
});