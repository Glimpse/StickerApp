import dispatcher from '../dispatcher';
import { CART_ACTIONS } from './actions.js';
import { addItem, removeItem } from '../utils/api/cart-api';

export function createItemsUpdatedAction(items) {
    dispatcher.dispatch({
        actionType: CART_ACTIONS.ITEMS_UPDATED_ACTION,
        items
    });
}

export function createUpdateFailedAction() {
    dispatcher.dispatch({
        actionType: CART_ACTIONS.UPDATE_FAILED_ACTION
    });
}

export function createAddToCartAction(item) {
    addItem(item);
}

export function createRemoveFromCartAction(item) {
    removeItem(item);
}
