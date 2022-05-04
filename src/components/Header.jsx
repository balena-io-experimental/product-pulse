import React from 'react';
import { Container, Txt } from 'rendition';

const Header = () => (
    <Container my={'2em'}>
        <Txt 
            fontSize={'2em'} 
            bold={true} 
            mb={'10px'} 
            align={'center'}
        >
            Product Pulse 👀
        </Txt>
    </Container>
);

export default Header;