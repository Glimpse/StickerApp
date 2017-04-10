import React from 'react';

import './empty-cart-view.css';

export default React.createClass({

    displayName: 'empty-cart-view',

    render() {
        return (
            <div className="gs-cartview-empty">
                <div className="gs-cartview-empty-tagline">Your shopping cart is empty</div>
                <img src="/img/Computer-with-stickers.png" />
                <a className="gs-cartview-empty-browse" href="/browse">Browse Stickers</a>
            </div>
        );
    }
});
