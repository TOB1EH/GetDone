// Limpia el localStorage al cargar la página
// localStorage.clear();

// Borramos solo datos sensibles, para no perder la preferencia del tema oscuro
localStorage.removeItem('token');
localStorage.removeItem('userId');
localStorage.removeItem('selectedGroupId');
localStorage.removeItem('selectedGroupRole');

document.addEventListener('DOMContentLoaded', () => {

    // Seleccionar el formulario de Login
    const form = document.getElementById('loginForm');

    // Escuchar el evento submit del formulario
    form.addEventListener('submit', async (e) => {
        e.preventDefault(); // Evitar el comportamiento default del formulario

        // Obtener los valores de los campos del formulario
        const user = {
            email: form.email.value.trim().toLowerCase(),
            password: form.password.value
        };

        // Validar que todos los campos esten completos
        if (!user.email || !user.password) {
            alert('Por favor, complete todos los campos');
            return;
        }

        try {

            const answer = await fetch('http://localhost:3000/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(user)
            });

            // convertir la respuesta a JSON
            const data = await answer.json();

            if (!answer.ok) {
                throw new Error(data.error || 'Error al iniciar sesión');
            }

            // Guarda el token en localStorage
            localStorage.setItem('token', data.token);
            // Guarda el userId en localStorage
            localStorage.setItem('userId', data.user.id); // <-- asegúrate que data.user.id existe


            console.log('Login exitoso:', data);

            window.location.href = '/views/user/home.html';

        } catch (error) {
            console.error('Error:', error);
            alert('Error al Iniciar Sesion. Por favor, intenta nuevamente');
        }
    });

});