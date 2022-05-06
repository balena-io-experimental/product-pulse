import React from 'react';
import { Flex, Spinner, Container } from 'rendition';

import ProductCard from './ProductCard';


const ProductCards = ({ loading, cardData, onClose, setActiveCard }) => (
    <Flex alignItems={'center'} flexDirection='column' mx={'2em'}>
        <Spinner emphasized show={loading}/>
        {
            Object.keys(cardData).length > 0 && 
            <Container mt={'2em'}>
                {
                    Object.entries(cardData).reverse().map(([key, model], idx) => (
                        <ProductCard
                            key={idx}
                            owner={key.split('/')[0]}
                            repo={key.split('/')[1]}
                            model={model}
                            onClose={() => onClose(key)}
                            setActiveCard={setActiveCard}
                        />
                    ))
                }
            </Container>
        }
    </Flex>
);

export default ProductCards;
