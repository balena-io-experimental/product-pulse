import React from 'react';
import { Container, Txt } from 'rendition';

const Header = () => (
    <Container>
        <Txt fontSize={'2em'} bold={true}>Product Pulse</Txt>
        <Txt fontSize={'1em'}>Enter a GitHub repo URL:</Txt>
    </Container>
);

export default Header;