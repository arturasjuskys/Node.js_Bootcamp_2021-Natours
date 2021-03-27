import axios from 'axios';
import { showAlert } from './alerts';

export const login = async (email, password) => {
    console.log(email, password);
    try {
        const res = await axios({
            method: 'POST',
            url: 'http://localhost:8000/api/v1/users/login',
            data: {
                email,
                password,
            },
        });

        if (res.data.status === 'success') {
            showAlert('success', 'Logged in successfully!');
            window.setTimeout(() => {
                // redirects to home page after 1.5 seconds
                location.assign('/');
            }, 1.5 * 1000);
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};
export const logout = async () => {
    try {
        const res = await axios({
            method: 'GET',
            url: 'http://localhost:8000/api/v1/users/logout',
        });
        if ((res.data.status = 'success')) location.reload();
    } catch (err) {
        showAlert('error', 'Error logging out! Try again.');
    }
};
