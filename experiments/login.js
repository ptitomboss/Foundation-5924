// Gestion du formulaire de connexion
(function(){
    const correctUsername = 'Dr. Robutstern';
    const correctPassword = 'my_love_in_this_foundation-5924.124';

    const form = document.getElementById('loginForm');
    const err = document.getElementById('error');

    form.addEventListener('submit', function(e){
        e.preventDefault();
        err.textContent = '';
        const username = document.getElementById('username').value.trim();
        const passwords = document.getElementById('pwd').value;

        if (username === correctUsername && passwords === correctPassword) {
            // Redirige vers la page suivante
            window.location.href = 'ARCHIVED-experiments/menu_of_ARCHIVED-experiments.html';
        } else {
            err.textContent = "The username or password is incorrect.";
        }
    });
})();
