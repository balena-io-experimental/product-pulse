import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'rendition';

import App from './components/App';

ReactDOM.render(
    <Provider>
        <App />
    </Provider>,
    document.getElementById('root')
);