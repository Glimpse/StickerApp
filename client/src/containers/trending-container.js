import React from 'react';
import { Container } from 'flux/utils';

import ExpandedItemView from '../views/expanded-item-view/expanded-item-view';
import HeaderView from '../views/header-view/header-view';
import StickerListView from '../views/sticker-list-view/sticker-list-view';

import authStore from '../stores/auth-store';
import cartStore from '../stores/cart-store';
import trendingStore from '../stores/trending-store';

import { createExpandItemAction, createCloseExpandedItemAction } from '../actions/trending-actions';

import './base.css';

class TrendingContainer extends React.Component {
    render() {
        let expandedItem;
        if (this.state.trending.expandedItem) {
            expandedItem = <ExpandedItemView item={this.state.trending.expandedItem} createCloseExpandedItemAction={createCloseExpandedItemAction} />;
        }
        return (
            <div>
                <HeaderView pageName="trending" cartCount={this.state.cart.items.length} userProfile={this.state.auth.userProfile} />
                <StickerListView items={this.state.trending.items} createExpandItemAction={createExpandItemAction} />
                {expandedItem}
            </div>
        );
    }
}

TrendingContainer.getStores = () => [authStore, cartStore, trendingStore];

TrendingContainer.calculateState = () => ({
    auth: authStore.getState(),
    cart: cartStore.getState(),
    trending: trendingStore.getState()
});

export default Container.create(TrendingContainer);
