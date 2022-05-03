import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'rendition';

import App from './App';

render(
    <Provider>
        <App />
    </Provider>,
    document.getElementById('root')
);