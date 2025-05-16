const email = document.getElementById('email');
const password = document.getElementById('password');
const loginButton = document.getElementById('login-btn');


function togglePassword() {
    const input = document.getElementById('password');
    input.type = input.type === 'password' ? 'text' : 'password';
}

const login = async (event) => {
    event.preventDefault();

    const emailValue = email.value.trim();
    const passwordValue = password.value.trim();

    if (!emailValue || !passwordValue) {
        alert('Please fill in all fields');
        return;
    }

    try {
        const response = await fetch('http://127.0.0.1:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: emailValue,
                password: passwordValue,
            }),
        });

        const data = await response.json();
        console.log(data);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', data.user);
        window.location.href = '/Client/main/index.html';
    } catch (error) {
        console.error('Error during login:', error);
        alert('An error occurred. Please try again.');
    }
};

const form = document.querySelector('form');
form.addEventListener('submit', login);
