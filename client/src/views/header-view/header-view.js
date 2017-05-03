import React from 'react';
import classname from 'classname';
import Icon from 'react-fa';
import { createChangedAuthProfileAction } from '../../actions/auth-actions';

import './header-view.css';

export default React.createClass({

    displayName: 'header-view',

    propTypes: {
        pageName: React.PropTypes.string.isRequired,
        cartCount: React.PropTypes.number.isRequired,
        userProfile: React.PropTypes.object
    },

    onAuthLinkClicked() {
        createChangedAuthProfileAction();
    },

    showAuth() {
        //Only show the log in and log out links when running with the new apit gateway which will result in the userProfile being passed to this view; if running
        //against the existing "monolith" service, userProfile will be null and we won't show these links.
        if (this.props.userProfile != null) {
            return (!this.props.userProfile.isAuthenticated ? (
                    <div className="gs-header-authinfo">Welcome, Guest! <a href="/users/auth?p=B2C_1_SignInAndSignUp" onClick={this.onAuthLinkClicked}>Log In</a></div>
                    ) : (
                    <div className="gs-header-authinfo">Welcome, {this.props.userProfile.userFriendlyId}! <a href="users/auth/logout" onClick={this.onAuthLinkClicked}>Log Out</a></div>
                    )
            );
        }
    },

    render() {
        return (
            <div className="gs-header">
                <div className="gs-header-decorator">
                    <a href="/"><img src="/img/Logo.png" /></a>
                    {this.showAuth()}
                </div>
                <div className="gs-header-navbar">
                    <div className="gs-header-navbar-spacer"></div>
                    <div className="gs-header-navbar-link-container">
                        <a href="/browse" className={classname({
                            'gs-header-navbar-link': true,
                            'gs-header-navbar-hover-enabled': this.props.pageName !== 'browse',
                            'gs-header-navbar-link-active': this.props.pageName === 'browse'
                        })}>Browse Stickers</a>
                        <a href="/trending" className={classname({
                            'gs-header-navbar-link': true,
                            'gs-header-navbar-hover-enabled': this.props.pageName !== 'trending',
                            'gs-header-navbar-link-active': this.props.pageName === 'trending'
                        })}>Trending Stickers</a>
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
