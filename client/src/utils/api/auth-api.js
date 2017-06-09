import * as profileActions from '../../actions/auth-actions';
import { request } from '../api';

export function getUserProfile() {

    console.log('User profile requested.');
    createGetUserProfileRequestAction();
    
    request({url: 'users/auth/user_profile'},
        (err, res) => {
            if (err || !res.profile) {
                console.log('Request for user profile failed.');
                createGetUserProfileFailAction();
                return;
            }
            console.log('Request for user profile succeeded.');
            createGetUserProfileSuccessAction(res.profile);
        }
    );
}
