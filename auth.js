// auth.js — Firebase Google Auth Module
// Usage: <script type="module" src="auth.js"></script>
// Requires: <div id="auth-btn-container"></div> in the page

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged }
    from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyBEJcVKwpeOfktwVfeI3SRTwIGrYq0GCEk",
    authDomain: "mypinyintyper.firebaseapp.com",
    projectId: "mypinyintyper",
    storageBucket: "mypinyintyper.firebasestorage.app",
    messagingSenderId: "812293877666",
    appId: "1:812293877666:web:caf33e58325b90585b4cfb",
    measurementId: "G-B0MQNSCJ0R"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// ── User cache in localStorage (for instant render before Firebase responds) ──
function saveUser(user) {
    if (user) {
        localStorage.setItem('auth_user', JSON.stringify({
            uid: user.uid, name: user.displayName,
            email: user.email, avatar: user.photoURL
        }));
    } else {
        localStorage.removeItem('auth_user');
    }
}

export function getCurrentUser() {
    try { return JSON.parse(localStorage.getItem('auth_user')); } catch { return null; }
}

// ── Auth actions ──────────────────────────────────────────────────
export async function loginWithGoogle() {
    const result = await signInWithPopup(auth, provider);
    saveUser(result.user);
    return result.user;
}

export async function logout() {
    await signOut(auth);
    saveUser(null);
    renderAuthButton();
}

// ── Score storage (per user UID) ──────────────────────────────────
function todayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function saveTypingScore(wpm, accuracy) {
    const user = getCurrentUser();
    if (!user) return { saved: false, reason: 'not_logged_in' };
    const key = `typing_scores_${user.uid}`;
    const scores = JSON.parse(localStorage.getItem(key) || '{}');
    const today = todayKey();
    if (!scores[today] || wpm > scores[today].wpm) {
        const isNewRecord = !!scores[today];
        const prevWpm = scores[today]?.wpm;
        scores[today] = { wpm, accuracy, ts: Date.now() };
        localStorage.setItem(key, JSON.stringify(scores));
        return { saved: true, isNewRecord, prevWpm };
    }
    return { saved: false, reason: 'not_best', currentBest: scores[today].wpm };
}

export function getTypingScores() {
    const user = getCurrentUser();
    if (!user) return {};
    return JSON.parse(localStorage.getItem(`typing_scores_${user.uid}`) || '{}');
}

// ── Render auth button ────────────────────────────────────────────
export function renderAuthButton() {
    const container = document.getElementById('auth-btn-container');
    if (!container) return;
    const user = getCurrentUser();
    if (user) {
        container.innerHTML = `
            <a href="profile.html" class="auth-btn auth-btn--user">
                ${user.avatar ? `<img src="${user.avatar}" class="auth-avatar" alt="" onerror="this.remove()">` : '👤'}
                <span>个人中心</span>
            </a>`;
    } else {
        container.innerHTML = `<button class="auth-btn auth-btn--login" id="authLoginBtn">🔑 登录</button>`;
        document.getElementById('authLoginBtn')?.addEventListener('click', showLoginModal);
    }
}

// ── Login modal ───────────────────────────────────────────────────
function showLoginModal() {
    document.getElementById('authModal')?.remove();
    const modal = document.createElement('div');
    modal.id = 'authModal';
    modal.className = 'auth-modal-overlay';
    modal.innerHTML = `
        <div class="auth-modal">
            <button class="auth-modal-close" id="authClose">✕</button>
            <div class="auth-modal-icon">⌨️</div>
            <h2 class="auth-modal-title">登录账号</h2>
            <p class="auth-modal-desc">登录后自动记录每日最高打字成绩</p>
            <div class="auth-modal-btns">
                <button class="auth-provider-btn auth-provider-google" id="authGoogleBtn">
                    <svg width="20" height="20" viewBox="0 0 48 48">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.29-8.16 2.29-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    </svg>
                    使用 Google 账号登录
                </button>
                <button class="auth-provider-btn auth-provider-apple" disabled>
                    <svg width="18" height="18" viewBox="0 0 814 1000" fill="currentColor">
                        <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105.5-57.8-155.5-127.4C46 407.9 0 263.7 0 127.9c0-74.3 12.8-147.1 38.4-216.2C62.8 25.4 108.5-46.4 161.3-81c52.8-34.6 109-46.5 162.5-46.5 88 0 144 45.5 192.5 45.5 47.2 0 120.7-47.5 220-47.5z"/>
                    </svg>
                    Apple 登录（即将支持）
                </button>
            </div>
        </div>`;
    document.body.appendChild(modal);
    const close = () => modal.remove();
    document.getElementById('authClose').addEventListener('click', close);
    modal.addEventListener('click', e => { if (e.target === modal) close(); });
    document.getElementById('authGoogleBtn').addEventListener('click', async () => {
        const btn = document.getElementById('authGoogleBtn');
        btn.disabled = true;
        btn.style.opacity = '0.7';
        const origText = btn.innerHTML;
        btn.innerHTML = '<span style="margin:auto">登录中…</span>';
        try {
            await loginWithGoogle();
            close();
            renderAuthButton();
            window.onAuthSuccess?.();
        } catch (err) {
            console.error(err);
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.innerHTML = origText;
            alert('登录失败。请通过 Live Server 或 HTTPS 域名访问此页面后重试。');
        }
    });
}

// ── Init: Firebase auth state listener ───────────────────────────
onAuthStateChanged(auth, user => {
    saveUser(user);
    renderAuthButton();
});

// Initial render using localStorage cache (instant, before Firebase responds)
renderAuthButton();
