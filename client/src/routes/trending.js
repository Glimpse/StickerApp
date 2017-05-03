'use strict';

import React from 'react'; // The React variable is used once the JSX is transformed into pure JS
import ReactDOM from 'react-dom';

import TrendingContainer from '../containers/trending-container';

ReactDOM.render(<TrendingContainer />, document.getElementById('content'));
