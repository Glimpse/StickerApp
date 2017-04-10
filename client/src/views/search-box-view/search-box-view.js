import React from 'react';
import { searchImage } from '../../utils/api/create-api';

import './search-box-view.css';

const SEARCH_BOX_SIZE = 40;

export default React.createClass({

    displayName: 'search-box-view',

    propTypes: {
        placeholder: React.PropTypes.string
    },

    // these logs are added to test and demonstrate browser side proxy for console logging
    testBrowserLogging() {
        /*
        // console.log
        console.log('1. Browser-side console logging tests...');
        console.log('2. console.log test: ' + 'searching image');
        console.log('3. console.log format test: %s has %d star!', 'glimpse', 5);
        console.log('4. console.log format test: %s has %d star %d', 'glimpse', 5);

        // console.info
        console.info('5. console.info test: %s', 'this is informational');

        // console.warn
        console.warn('%d. console.warn test: %s', 6, 'this is a warning!');

        // console.error
        console.error('7. console.error test: this is an error!');

        //console.assert
        console.assert(true, '8. console.assert test: assert succeeded');
        */
    },

    onKeyPressed(event) {
        if (event.key === 'Enter') {
            this.testBrowserLogging();
            searchImage(event.target.value);
        }
    },

    render() {
        return (
            <div className="gs-create-search">
                <input
                    type="text"
                    className="gs-create-search-input"
                    placeholder={this.props.placeholder}
                    size={SEARCH_BOX_SIZE}
                    onKeyPress={this.onKeyPressed}
                    />
            </div>
        );
    }
});
