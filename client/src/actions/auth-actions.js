import dispatcher from '../dispatcher';
import { AUTH_ACTIONS } from './actions.js';
import { getUserProfile } from '../utils/api/auth-api';

export function createAuthChangedAction(userProfile) {
    console.log('Authentication status changed');
    dispatcher.dispatch({
        actionType: AUTH_ACTIONS.AUTH_CHANGED_ACTION,
        userProfile: userProfile
    });
}

export function createChangedAuthProfileAction() {
    getUserProfile();
}
