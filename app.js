/***********************
 * FIREBASE CONFIG
 ***********************/
const firebaseConfig = {
  apiKey: "API_KEY",
  authDomain: "PROJECT_ID.firebaseapp.com",
  projectId: "PROJECT_ID",
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

/***********************
 * CONSTANTS
 ***********************/
const ADMIN_EMAIL = "umwamiking2500@gmail.com";
const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;

/***********************
 * AUTH STATE
 ***********************/
auth.onAuthStateChanged(async user => {
  if (!user) return;

  // Admin check
  if (user.email === ADMIN_EMAIL) {
    showAdminPanel();
  }

  // Load user data
  const snap = await db.collection("users").doc(user.uid).get();
  if (!snap.exists) {
    await db.collection("users").doc(user.uid).set({
      vip: false,
      vipUntil: null,
      createdAt: Date.now()
    });
  }

  checkVIP(user.uid);
});

/***********************
 * REGISTER
 ***********************/
function register() {
  const email = document.getElementById("regEmail").value;
  const pass = document.getElementById("regPassword").value;

  auth.createUserWithEmailAndPassword(email, pass)
    .then(() => alert("Account yakozwe neza ✅"))
    .catch(err => alert(err.message));
}

/***********************
 * LOGIN
 ***********************/
function login() {
  const email = document.getElementById("logEmail").value;
  const pass = document.getElementById("logPassword").value;

  auth.signInWithEmailAndPassword(email, pass)
    .then(() => alert("Winjiye neza 🔓"))
    .catch(err => alert(err.message));
}

/***********************
 * VIP CHECK
 ***********************/
async function checkVIP(uid) {
  const doc = await db.collection("users").doc(uid).get();
  const data = doc.data();

  if (data.vipUntil && Date.now() < data.vipUntil) {
    enableVIP();
  } else {
    disableVIP();
  }
}

function enableVIP() {
  document.body.classList.add("vip");
}

function disableVIP() {
  document.body.classList.remove("vip");
}

/***********************
 * ACTIVATE VIP (ADMIN / PAYMENT CALLBACK)
 ***********************/
async function activateVIP(uid) {
  await db.collection("users").doc(uid).update({
    vip: true,
    vipUntil: Date.now() + ONE_WEEK
  });
}

/***********************
 * MOMO PAY (FLUTTERWAVE REDIRECT)
 ***********************/
function payVIP() {
  window.location.href =
    "https://checkout.flutterwave.com/v3/hosted/pay/REPLACE_WITH_YOUR_LINK";
}

/***********************
 * DOWNLOAD PROTECTION
 ***********************/
async function downloadMovie(fileId) {
  const user = auth.currentUser;
  if (!user) {
    alert("Bananza winjire 🔒");
    return;
  }

  const doc = await db.collection("users").doc(user.uid).get();
  const data = doc.data();

  if (!data.vipUntil || Date.now() > data.vipUntil) {
    alert("Download ni iya VIP gusa 💎");
    return;
  }

  window.location.href =
    "https://drive.google.com/uc?export=download&id=" + fileId;
}

/***********************
 * REBA ONLINE + PRE-ROLL ADS
 ***********************/
function watchMovie(fileId) {
  document.getElementById("playerModal").style.display = "block";

  let seconds = 5;
  const skipText = document.getElementById("skipText");
  const adBox = document.getElementById("adContainer");
  const movieFrame = document.getElementById("movieFrame");

  const timer = setInterval(() => {
    seconds--;
    skipText.innerText = "Skip in " + seconds + "s";

    if (seconds <= 0) {
      clearInterval(timer);
      adBox.style.display = "none";
      movieFrame.style.display = "block";
      movieFrame.src =
        "https://drive.google.com/file/d/" + fileId + "/preview";
    }
  }, 1000);
}

/***********************
 * ADMIN PANEL
 ***********************/
function showAdminPanel() {
  document.getElementById("adminPanel").style.display = "block";
}

async function makeUserVIP(uid) {
  await activateVIP(uid);
  alert("User yabaye VIP ✅");
}

/***********************
 * LOGOUT
 ***********************/
function logout() {
  auth.signOut();
}
