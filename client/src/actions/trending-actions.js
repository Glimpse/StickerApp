import dispatcher from '../dispatcher';
import { TRENDING_ACTIONS } from './actions';
import { recordStickerView } from '../utils/api/history-api';

export function createItemsUpdatedAction(items) {
    dispatcher.dispatch({
        actionType: TRENDING_ACTIONS.ITEMS_UPDATED_ACTION,
        items
    });
}

export function createExpandItemAction(id) {
    recordStickerView(id);
    dispatcher.dispatch({
        actionType: TRENDING_ACTIONS.EXPAND_ITEM_ACTION,
        id
    });
}

export function createCloseExpandedItemAction() {
    dispatcher.dispatch({
        actionType: TRENDING_ACTIONS.CLOSE_EXPANDED_ITEM_ACTION
    });
}
