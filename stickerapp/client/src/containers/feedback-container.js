import React from 'react';

import HeaderView from '../views/header-view/header-view';
import FeedbackView from '../views/checkout-view/feedback-view';

import './base.css';

const FeedbackContainer = React.createClass({
    render() {
        return (
            <div>
                <HeaderView pageName="cart" cartCount="0"/>
                <FeedbackView />
            </div>
        );
    }
});

export default FeedbackContainer;
