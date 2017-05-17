import { ReduceStore } from 'flux/utils';
import dispatcher from '../dispatcher';
import { AUTH_ACTIONS } from '../actions/actions';
import { getUserProfile } from '../utils/api/auth-api';

// Kickstart the initial fetch of the user's profile
getUserProfile();

class AuthStore extends ReduceStore {

    getInitialState() {
        return { userProfile: null };
    }

    reduce(state, action) {
        switch (action.actionType) {
            case AUTH_ACTIONS.AUTH_CHANGED_ACTION : {
                console.log('View triggered auth changed action');
                return { userProfile: action.userProfile  };
            }

            default: { return state; }
        }
    }
}

export default new AuthStore(dispatcher);
