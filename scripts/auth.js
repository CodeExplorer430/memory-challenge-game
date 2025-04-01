document.addEventListener('DOMContentLoaded', () => {
    const googleLogin = document.getElementById('googleLogin');
    const facebookLogin = document.getElementById('facebookLogin');
    const logoutBtn = document.getElementById('logoutBtn');

    // Auth state listener
    auth.onAuthStateChanged(user => {
        if (user) {
            document.querySelector('.auth-buttons').classList.add('d-none');
            logoutBtn.classList.remove('d-none');
        } else {
            document.querySelector('.auth-buttons').classList.remove('d-none');
            logoutBtn.classList.add('d-none');
        }
    });

    // Google Login
    googleLogin.addEventListener('click', () => {
        auth.signInWithPopup(googleProvider)
            .catch(error => console.error('Google login error:', error));
    });

    // Facebook Login
    facebookLogin.addEventListener('click', () => {
        auth.signInWithPopup(facebookProvider)
            .catch(error => console.error('Facebook login error:', error));
    });

    // Logout
    logoutBtn.addEventListener('click', () => {
        auth.signOut();
    });
});