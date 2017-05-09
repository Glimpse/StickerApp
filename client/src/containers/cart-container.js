import React from 'react';
import { Container } from 'flux/utils';

import HeaderView from '../views/header-view/header-view';
import EmptyCartView from '../views/empty-cart-view/empty-cart-view';
import NormalCartView from '../views/normal-cart-view/normal-cart-view';

import cartStore from '../stores/cart-store';

import './base.css';

class CartContainer extends React.Component {
    render() {
        const cartView = this.state.cart.items.length === 0 ?
            <EmptyCartView /> :
            <NormalCartView items={this.state.cart.items} />;
        return (
            <div>
                <HeaderView pageName="cart" cartCount={this.state.cart.items.length}/>
                {cartView}
            </div>
        );
    }
}

CartContainer.getStores = () => [ cartStore ];

CartContainer.calculateState = () => ({
    cart: cartStore.getState()
});

export default Container.create(CartContainer);
