const email = document.getElementById('email');
const password = document.getElementById('password');
const registerButton = document.getElementById('register-btn');
const confirmPassword = document.getElementById('confirmPassword');

function togglePassword(id) {
    const input = document.getElementById(id);
    if (input.type === 'password') {
        input.type = 'text';
    } else {
        input.type = 'password';
    }
}

const register = async (event) => {
    event.preventDefault();

    const emailValue = email.value.trim();
    const passwordValue = password.value.trim();
    const confirmPasswordValue = confirmPassword.value.trim();

    if (passwordValue !== confirmPasswordValue) {
        alert('Passwords do not match');
        return;
    }

    if (!emailValue || !passwordValue) {
        alert('Please fill in all fields');
        return;
    }

    try {
        const response = await fetch(
            'http://127.0.0.1:5000/api/auth/register',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: emailValue,
                    password: passwordValue,
                }),
            }
        );

        const data = await response.json();
        console.log(data.msg);
        if (data.msg !== 'User registered successfully') {
            //!! Emre buralara alert yerine component gelsin hem register hem login için
            alert(data.msg);
            return;
        }

        // window.location.href = '/Client/Login/index.html';
    } catch (error) {
        console.error('Error during register:', error);
    }
};

const form = document.querySelector('form');
form.addEventListener('submit', register);
