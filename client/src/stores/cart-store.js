import { ReduceStore } from 'flux/utils';
import dispatcher from '../dispatcher';
import { CART_ACTIONS } from '../actions/actions';
import { updateItems } from '../utils/api/cart-api';

// Kickstart the initial fetch of items
updateItems();

class CartStore extends ReduceStore {

    getInitialState() {
        return {
            items: []
        };
    }

    reduce(state, action) {
        switch (action.actionType) {
            case CART_ACTIONS.ITEMS_UPDATED_ACTION: {
                return {
                    items: action.items
                };
            }

            default: {
                return state;
            }
        }
    }
}

export default new CartStore(dispatcher);
