// Gestion du formulaire de connexion
(function(){
    const correctUsername = 'Dr. Robutstern';
    const correctPassword = 'my_love_in_this_foundation-5924.124';

    const form = document.getElementById('loginForm');
    const err = document.getElementById('error');

    form.addEventListener('submit', function(e){
        e.preventDefault();
        err.textContent = '';
        const u = document.getElementById('username').value.trim();
        const p = document.getElementById('pwd').value;

        if (u === correctUsername && p === correctPassword) {
            // Redirige vers la page suivante
            window.location.href = 'ARCHIVED-experiments/menu_of_ARCHIVED-experiments.html';
        } else {
            err.textContent = "Nom d'utilisateur ou mot de passe incorrect.";
        }
    });
})();
