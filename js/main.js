// ======================
// IMPORT FIREBASE
// ======================
import { getBalance, changeBalance } from "./firebase.js";


// ======================
// CLOCK
// ======================
function updateClock() {
    const clockEl = document.getElementById("clock");
    const dateEl = document.getElementById("date");

    if (clockEl) clockEl.textContent = new Date().toLocaleTimeString();
    if (dateEl) dateEl.textContent = new Date().toDateString();
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

            gapi.client.setToken(tokenResponse);

            const btn = document.getElementById("loginButton");
            if (btn) btn.style.display = "none";

            listUpcomingEvents();
        },
    });

    // 🟢 SAFETY: ensure button exists even if GIS loads late
    ensureLoginButton();
}


// ======================
// LOGIN BUTTON SAFE CREATION
// ======================
function ensureLoginButton() {
    const container = document.getElementById("loginButton");

    if (!container) return;

    container.style.display = "block";
    container.innerHTML = `
        <button onclick="handleLogin()">Sign in with Google</button>
    `;
}


// ======================
// LOGIN
// ======================
function handleLogin() {
    if (!tokenClient) {
        console.error("Google login not ready yet");
        return;
    }

    tokenClient.requestAccessToken({ prompt: "consent" });
}

window.handleLogin = handleLogin;


// ======================
// CALENDAR
// ======================
async function listUpcomingEvents() {

    try {
        let response = await gapi.client.calendar.events.list({
            calendarId: "primary",
            timeMin: new Date().toISOString(),
            showDeleted: false,
            singleEvents: true,
            maxResults: 8,
            orderBy: "startTime",
        });

        const events = response.result.items || [];

        let html = "";

        if (events.length === 0) {
            html = `<p style="color:gray;">No upcoming events</p>`;
        } else {
            events.forEach(event => {

                const title = event.summary || "No Title";

                const time = event.start?.dateTime || event.start?.date;

                const formattedTime = event.start?.dateTime
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

    } catch (err) {
        console.error("Calendar error:", err);
    }
}


// ======================
// BALANCE (FIREBASE SAFE)
// ======================

async function loadBalance() {
    try {
        const amount = await getBalance();

        const safeAmount = Number(amount ?? 0);

        const el = document.getElementById("balanceValue");
        if (el) el.textContent = safeAmount.toFixed(2);

    } catch (err) {
        console.error("Balance load error:", err);
    }
}

async function addMoney() {
    const input = parseFloat(document.getElementById("balanceInput")?.value);

    if (isNaN(input)) return;

    await changeBalance(input);
    loadBalance();
}

async function removeMoney() {
    const input = parseFloat(document.getElementById("balanceInput")?.value);

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

    ensureLoginButton();

    const addBtn = document.getElementById("addBtn");
    const removeBtn = document.getElementById("removeBtn");

    if (addBtn) addBtn.addEventListener("click", addMoney);
    if (removeBtn) removeBtn.addEventListener("click", removeMoney);

    loadBalance();
});