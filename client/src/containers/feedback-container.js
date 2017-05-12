import React from 'react';
import { Container } from 'flux/utils';

import HeaderView from '../views/header-view/header-view';
import FeedbackView from '../views/checkout-view/feedback-view';

import authStore from '../stores/auth-store';

import './base.css';

const FeedbackContainer = React.createClass({
    render() {
        return (
            <div>
                {/*<HeaderView pageName="cart" cartCount="0" isAuthenticated={this.state.auth.isAuthenticated} userFriendlyId={this.state.auth.userFriendlyId}/>*/}
                 <  HeaderView pageName="cart" cartCount={0} userProfile={this.state.auth.userProfile} />
                <FeedbackView />
            </div>
        );
    }
});

FeedbackContainer.getStores = () => [ authStore ];

FeedbackContainer.calculateState = () => ({
    auth: authStore.getState()
});

export default Container.create(FeedbackContainer);
