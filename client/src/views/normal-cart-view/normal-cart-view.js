import React from 'react';
import Icon from 'react-fa';
import { v4 } from 'node-uuid'; // Yes this works in the browser too
import { createRemoveFromCartAction } from '../../actions/cart-actions';

import './normal-cart-view.css';

// Temporary until we implement actual auth
if (!localStorage.token) {
    localStorage.token = v4();
}
const token = localStorage.token;

const ItemRow = React.createClass({

    displayName: 'item-row',

    propTypes: {
        item: React.PropTypes.object
    },

    getInitialState() {
        return {
            quantity: 1
        };
    },

    onQuantityChanged(e) {
        this.setState({ quantity: e.target.value });
    },

    onItemRemoved() {
        createRemoveFromCartAction(this.props.item);
    },

    render() {
        const item = this.props.item;
        return (
            <div key={item.id} className="gs-cartview-normal-leftpane-row">
                <div className="gs-cartview-normal-leftpane-row-product">
                    <img src={item.image} />
                    <div>
                        <div>
                            <span className="gs-cartview-normal-leftpane-row-product-name">{item.name}</span>
                            <span className="gs-cartview-normal-leftpane-row-product-by"> by </span>
                            <span className="gs-cartview-normal-leftpane-row-product-author">{item.author}</span>
                        </div>
                        <div className="gs-cartview-normal-leftpane-row-product-size">{item.size.width} x {item.size.height}</div>
                    </div>
                </div>
                <div className="gs-cartview-normal-leftpane-row-total">Free</div>
                <div className="gs-cartview-normal-leftpane-row-quantity">
                    <select name={`checkout-items[${item.id}][quantity]`}
                            value={this.state.quantity}
                            onChange={this.onQuantityChanged}
                            data-item-id={item.id}>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                    </select>
                </div>
                <Icon name="close" className="gs-cartview-normal-leftpane-close" onClick={this.onItemRemoved} />
                <input type="hidden" value={item.id} name={`checkout-items[${item.id}][id]`} />
            </div>
        );
    }
});

export default React.createClass({

    displayName: 'normal-cart-view',

    propTypes: {
        items: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
        userProfile: React.PropTypes.object
    },

    getInitialState() {
        return {
            fullName: this.props.userProfile != null && this.props.userProfile.isAuthenticated ? this.props.userProfile.fullName : '',
            email: this.props.userProfile != null && this.props.userProfile.isAuthenticated ? this.props.userProfile.email : ''
        };
    },

    onNameChanged(e) {
        this.setState({ fullName: e.target.value });
    },

    onEmailChanged(e) {
        this.setState({ email: e.target.value });
    },

    render() {
        const items = this.props.items;

        // TODO: items is an array of IDs, need to look up or convert to whole objects
        const itemRows = items.map((item) => <ItemRow item={item} key={item.id} />);

        var rightPane = null;
        if (this.props.userProfile != null && this.props.userProfile.isAuthenticated) {
            // If the user is logged in, include the checkout form in the right pane
            rightPane = 
                <div className="gs-cartview-normal-rightpane">
                    <div className="gs-cartview-normal-rightpane-label">Name</div>
                    <input placeholder="required"
                        value={this.state.fullName}
                        onChange={this.onNameChanged}
                        className="gs-cartview-normal-rightpane-input" name="checkout-name" min="1"/>
                    <div className="gs-cartview-normal-rightpane-label">Email Address</div>
                    <input placeholder="required"
                        name="email"
                        value={this.state.email}
                        onChange={this.onEmailChanged}
                        className="gs-cartview-normal-rightpane-input" name="checkout-email" type="email" min="1"/>
                    <div className="gs-cartview-normal-rightpane-disclaimer">
                        *You will be able to pick up your stickers right after the order is processed. No physical address is required.
                    </div>
                    <div className="gs-cartview-normal-rightpane-submitcontainer">
                        <button type="submit" className="gs-cartview-normal-rightpane-submit">
                            <Icon className="gs-cartview-normal-rightpane-submit-icon" name="lock" size="lg" />
                            <div>Print my stickers</div>
                        </button>
                    </div>
                </div>
        } else {
            // If the user is not logged in, provide a button to redirect to the login page
            rightPane = 
                    <div className="gs-cartview-normal-rightpane">
                        <div className="gs-cartview-normal-rightpane-label">Log In to Print Stickers</div>
                        <div className="gs-cartview-normal-rightpane-submitcontainer">
                            <a className="gs-cartview-normal-rightpane-submit" href="/users/auth?p=B2C_1_SignInAndSignUp">Log In</a>
                        </div>
                    </div>
        }

        return (
            <div className="gs-cartview-normal">

                <div className="gs-cartview-normal-header">
                    You have <span className="gs-cartview-normal-header-count">
                        {items.length}
                    </span> {items.length === 1 ? 'item' : 'items'} in your cart.
                </div>

                <form className="gs-cartview-normal-body" action="/checkout" method="post">

                    <div className="gs-cartview-normal-leftpane">
                        <div className="gs-cartview-normal-leftpane-header">
                            <div className="gs-cartview-normal-leftpane-header-products">Products</div>
                            <div className="gs-cartview-normal-leftpane-header-total">Total</div>
                            <div className="gs-cartview-normal-leftpane-header-quantity">Quantity</div>
                        </div>
                        {itemRows}
                        <input type="hidden" name="token" value={token} />
                    </div>

                    {rightPane}
                </form>

            </div>
        );
    }
});
