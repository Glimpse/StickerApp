import dispatcher from '../dispatcher';
import { AUTH_ACTIONS } from './actions.js';
import { getUserProfile } from '../utils/api/auth-api';

export function createGetUserProfileSuccessAction(userProfile) {
    console.log('Get user profile action successful.');
    dispatcher.dispatch({
        actionType: AUTH_ACTIONS.GET_PROFILE_SUCCESS_ACTION,
        userProfile: userProfile
    });
}

export function createGetUserProfileFailAction() {
    console.log('Get user profile action failed.');
    dispatcher.dispatch({
        actionType: AUTH_ACTIONS.GET_PROFILE_FAILED_ACTION
    });
}

export function createGetUserProfileRequestAction() {
    console.log('Get user profile action requested.');
    dispatcher.dispatch({
        actionType: AUTH_ACTIONS.GET_PROFILE_REQUEST_ACTION
    });
}

export function createGetUserProfileAction() {
    getUserProfile();
}
