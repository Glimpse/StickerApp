import { createAuthChangedAction } from '../../actions/auth-actions';
import { request } from '../api';

export function getUserProfile() {
    request({
        url: 'users/auth/user_profile'
    }, (err, res) => {
        if (err) {
            return;
        }
        console.log('Requesting updated user profile after auth changed');
        createAuthChangedAction(res.profile);
    }
);}
