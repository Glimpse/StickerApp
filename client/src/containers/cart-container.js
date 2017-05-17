import React from 'react';
import { Container } from 'flux/utils';

import HeaderView from '../views/header-view/header-view';
import EmptyCartView from '../views/empty-cart-view/empty-cart-view';
import NormalCartView from '../views/normal-cart-view/normal-cart-view';

import cartStore from '../stores/cart-store';
import authStore from '../stores/auth-store';

import './base.css';

const CartContainer = React.createClass({
    render() {
        const cartView = this.state.cart.items.length === 0 ?
            <EmptyCartView /> :
            <NormalCartView items={this.state.cart.items} userProfile={this.state.auth.userProfile} />;
        return (
            <div>
                 <HeaderView pageName="cart" cartCount={this.state.cart.items.length} userProfile={this.state.auth.userProfile} />

                {cartView}
            </div>
        );
    }
});

CartContainer.getStores = () => [ cartStore, authStore ];

CartContainer.calculateState = () => ({
    cart: cartStore.getState(),
    auth: authStore.getState()
});

export default Container.create(CartContainer);
