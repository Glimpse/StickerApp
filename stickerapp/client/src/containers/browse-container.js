import React from 'react';
import { Container } from 'flux/utils';

import HeaderView from '../views/header-view/header-view';
import TagListView from '../views/tag-list-view/tag-list-view';
import StickerListView from '../views/sticker-list-view/sticker-list-view';
import ExpandedItemView from '../views/expanded-item-view/expanded-item-view';

import browseStore from '../stores/browse-store';
import cartStore from '../stores/cart-store';

import { createExpandItemAction, createCloseExpandedItemAction } from '../actions/browse-actions';

import './base.css';

const BrowseContainer = React.createClass({
    render() {
        let expandedItem;
        if (this.state.browse.expandedItem) {
            expandedItem = <ExpandedItemView item={this.state.browse.expandedItem} createCloseExpandedItemAction={createCloseExpandedItemAction}/>;
        }
        return (
            <div>
                <HeaderView pageName="browse" cartCount={this.state.cart.items.length}/>
                <TagListView tags={this.state.browse.tags} selectedTags={this.state.browse.selectedTags} />
                <StickerListView items={this.state.browse.items} createExpandItemAction={createExpandItemAction} />
                {expandedItem}
            </div>
        );
    }
});

BrowseContainer.getStores = () => [ browseStore, cartStore ];

BrowseContainer.calculateState = () => ({
    browse: browseStore.getState(),
    cart: cartStore.getState()
});

export default Container.create(BrowseContainer);
