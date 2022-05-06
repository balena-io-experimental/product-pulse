import React, { useEffect, useState } from 'react';
import { Input, Container, Divider, Txt } from 'rendition';
import { useDebounce } from 'use-debounce';

import Header from './Header';

import { getOwnerAndRepo } from '../utils';
import ProductCards from './ProductCards';
import InfoCard from './InfoCard';

const App = () => {
    /**
     * STATE
     */
    // Visual state
    const [input, setInput] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [active, setActive] = useState('');

    // Data state
    const [cardData, setCardData] = useState({});
    // Only validate and search after change events stop firing on input
    const [uri] = useDebounce(input, 1000);

    /**
     * HOOKS
     */
    /**
     * Fetch model from GitHub URI in user input
     * @param {string} URI 
     */
    const fetchForRepo = async(owner, repo) => {
        const ownerRepoString = `${owner}/${repo}`;
        const resp = await fetch(`/pulse/${ownerRepoString}`);
        const body = await resp.json();
        if(!resp.ok) {
            throw new Error(body);
        }
        setErrorMessage('');
        return body;
    }

    const addColorsForCategories = ({ legend, data }) => {
        for (const category in data) {
            data[category].color = data[category].score < legend[0] ? 
                'red' : 
                (
                    data[category].score < legend[1] ? 
                        'yellow' : 
                        'green'
                );
        }
        return data;
    }

    /**
     * Update model based on GitHub URI in user input
     * @param {string} URI 
     */
    const updateModel = async (URI) => {
        const [owner, repo] = getOwnerAndRepo(URI);
        const ownerRepoString = `${owner}/${repo}`;

        if (cardData[ownerRepoString]) {
            return;
        }

        setLoading(true);
        try {
            const data = await fetchForRepo(owner, repo)
                .then(addColorsForCategories);

            // TODO: Remove this - console.logging it for demo
            console.log({ [ownerRepoString]: data });

            setCardData(prevCardData => ({
                ...prevCardData,
                [ownerRepoString]: data
            }));
        } catch(e) {
            console.error(e);
            setErrorMessage(e.message);
        } finally {
            setLoading(false);
        }
    }

    const setActiveCard = (ownerRepo) => {
        active === ownerRepo ?
            setActive('') :
            setActive(ownerRepo);
    }

    const onClose = (ownerRepo) => {
        const newCardData = { ...cardData };
        delete newCardData[ownerRepo];
        setCardData(newCardData);
        if (active === ownerRepo) {
            setActiveCard('');
        }
    }

    useEffect(() => {
        if (!uri) {
            return;
        }

        updateModel(uri);
    }, [uri]);

    /**
     * JSX
     */
    return (
        <Container width={'50%'} height={'100%'}>
            <Header />
            <Container>
                <label 
                    fontSize={'1em'} 
                    htmlFor={'github-url'}
                >
                    Enter a GitHub repo or URL:
                </label>
                <Input
                    my={'0.5em'}
                    id={'github-url'}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    invalid={errorMessage !== ''}
                    autoCorrect={'false'}
                    spellCheck={'false'}
                />
                <Txt color={'red'} height={'1.5em'}>{errorMessage}</Txt>
            </Container>
            <Divider mt={'1em'} pb={'1em'} />
            <ProductCards
                loading={loading}
                cardData={cardData}
                onClose={onClose}
                setActiveCard={setActiveCard}
            />
            <InfoCard
                cardData={cardData}
                active={active}
            />
        </Container>
    );
}

export default App;