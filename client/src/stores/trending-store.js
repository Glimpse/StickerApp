import { ReduceStore } from 'flux/utils';
import dispatcher from '../dispatcher';
import { TRENDING_ACTIONS } from '../actions/actions';
import * as io from 'socket.io-client';
import { createItemsUpdatedAction } from '../actions/trending-actions';

const socket = io.connect('/');
socket.on('message', topStickers => createItemsUpdatedAction(topStickers));

class TrendingStore extends ReduceStore {
    getInitialState() {
        return { items: [], expandedItem: null };
    }

    reduce(state, action) {
        switch (action.actionType) {
            case TRENDING_ACTIONS.CLOSE_EXPANDED_ITEM_ACTION: {
                return Object.assign({}, state, { expandedItem: null });
            }

            case TRENDING_ACTIONS.EXPAND_ITEM_ACTION: {
                const expandedItem = state.items.filter(item => item.id === action.id)[0];
                if (!expandedItem) {
                    throw new Error(`Internal error: id ${action.id} does not exist`);
                }
                return Object.assign({}, state, { expandedItem });
            }

            case TRENDING_ACTIONS.ITEMS_UPDATED_ACTION: {
                return Object.assign({}, state, { items: action.items });
            }

            default: {
                return state;
            }
        }
    }
}

export default new TrendingStore(dispatcher);
