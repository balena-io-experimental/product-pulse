import React from 'react';
import { Input, Container, Card } from 'rendition';

import Header from './Header';
import ProductCard from './ProductCard';

const App = () => {
    return (
        <>
            <Header />
            <Container mb={'1em'}>
                <Input x='5em'/>
            </Container>

            <ProductCard 
                directed={'red'}
                maintained={'green'}
                issues={'yellow'}
            />
            
        </>
    );
}

export default App;