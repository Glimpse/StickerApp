import { createUpdateFailedAction, createItemsUpdatedAction } from '../../actions/cart-actions';
import { request } from '../api';

export function updateItems() {
    request({
        url: 'cart/api/items'
    }, (err, res) => {
        if (err) {
            createUpdateFailedAction();
            return;
        }
        createItemsUpdatedAction(res.items);
    });
}

export function addItem(item) {
    request({
        url: `cart/api/items/${item.id}`,
        method: 'PUT',
        payload: { item }
    }, (err, res) => {
        if (err) {
            createUpdateFailedAction();
            return;
        }

        // The API returns the complete list of items to force the system to get
        // in sync, in case something bad happened to get it out of sync
        createItemsUpdatedAction(res.items);
    });
}

export function removeItem(item) {
    request({
        url: `cart/api/items/${item.id}`,
        method: 'DELETE'
    }, (err, res) => {
        if (err) {
            createUpdateFailedAction();
            return;
        }

        // The API returns the complete list of items to force the system to get
        // in sync, in case something bad happened to get it out of sync
        createItemsUpdatedAction(res.items);
    });
}
