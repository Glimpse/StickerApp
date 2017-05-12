import React from 'react';
import { Container } from 'flux/utils';

import HeaderView from '../views/header-view/header-view';
import CheckoutView from '../views/checkout-view/checkout-view';

import authStore from '../stores/auth-store';

import './base.css';

const CheckoutContainer = React.createClass({
    render() {
        return (
            <div>
                 <HeaderView pageName="cart" cartCount={0} userProfile={this.state.auth.userProfile} />
                <CheckoutView />
            </div>
        );
    }
});

CheckoutContainer.getStores = () => [ authStore ];

CheckoutContainer.calculateState = () => ({
    auth: authStore.getState()
});

export default Container.create(CheckoutContainer);
