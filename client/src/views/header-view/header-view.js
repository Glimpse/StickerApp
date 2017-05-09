import React from 'react';
import classname from 'classname';
import Icon from 'react-fa';

import './header-view.css';

export default React.createClass({

    displayName: 'header-view',

    propTypes: {
        pageName: React.PropTypes.string.isRequired,
        cartCount: React.PropTypes.number.isRequired
    },

    render() {
        return (
            <div className="gs-header">
                <div className="gs-header-decorator">
                    <a href="/"><img src="/img/Logo.png" /></a>
                </div>
                <div className="gs-header-navbar">
                    <div className="gs-header-navbar-spacer"></div>
                    <div className="gs-header-navbar-link-container">
                        <a href="/browse" className={classname({
                            'gs-header-navbar-link': true,
                            'gs-header-navbar-hover-enabled': this.props.pageName !== 'browse',
                            'gs-header-navbar-link-active': this.props.pageName === 'browse'
                        })}>Browse Stickers</a>
                        <a href="/create" className={classname({
                            'gs-header-navbar-link': true,
                            'gs-header-navbar-hover-enabled': this.props.pageName !== 'create',
                            'gs-header-navbar-link-active': this.props.pageName === 'create'
                        })}>Search on Flickr</a>
                    </div>
                    <a href="/cart" className={classname({
                        'gs-header-navbar-cart': this.props.pageName !== 'cart',
                        'gs-header-navbar-cart-active': this.props.pageName === 'cart'
                    })}>
                        <Icon name="shopping-cart" className="gs-header-navbar-cart-icon" />
                        <div>View Cart ({this.props.cartCount})</div>
                    </a>
                </div>
            </div>
        );
    }
});
