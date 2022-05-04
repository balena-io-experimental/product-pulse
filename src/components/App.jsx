import React, { useEffect, useState } from 'react';
import { Input, Container, Divider, Txt, Box, Flex } from 'rendition';
import { useDebounce } from 'use-debounce';

import Header from './Header';
import ProductCard from './ProductCard';
import { isGitHubUri } from '../validation';
import * as Github from '../github';
import { INVALID_URI, URI_DOES_NOT_EXIST } from '../errors';
import { getModel } from '../model';

const App = () => {
    /**
     * STATE
     */
    const [input, setInput] = useState('');
    // Only validate and search after change events stop firing on input
    const [uri] = useDebounce(input, 1000);
    const [errorMessage, setErrorMessage] = useState('');

    const [ownersAndRepos, setOwnersAndRepos] = useState([]);
    const [models, setModels] = useState({});

    const [keyToUpdate, setKeyToUpdate] = useState('');

    /**
     * HOOKS
     */

    /**
     * Update user message based on GitHub URI in user input
     * @param {string} URI 
     * @returns boolean
     */
    const updateMessage = async (URI) => {
        // Check if valid GitHub URI string
        const isValidUri = isGitHubUri(URI);
        if (!isValidUri) {
            setErrorMessage(INVALID_URI);
            return false;
        }

        let [owner, repo] = Github.getOwnerAndRepo(URI);
        // Check if accessible repo
        const isAccessible = await Github.isAccessibleRepo(owner, repo);
        if (!isAccessible) {
            setErrorMessage(URI_DOES_NOT_EXIST);
            return false;
        }

        setErrorMessage('');
        setOwnersAndRepos([...ownersAndRepos, [owner, repo]]);
        setKeyToUpdate(`${owner}/${repo}`);
        return true;
    }

    const onClose = (key) => {
        setKeyToUpdate(null);

        setOwnersAndRepos(ownersAndRepos.filter(
            ownerAndRepo => `${ownerAndRepo[0]}/${ownerAndRepo[1]}` !== key
        ));
        const newModel = {...models};
        delete newModel[key];
        console.log(newModel);
        setModels(newModel);

    }

    useEffect(() => {
        if (!uri) {
            return;
        }

        updateMessage(uri);
    }, [uri]);

    useEffect(() => {
        const ownerAndRepo = ownersAndRepos.find(
            ownerAndRepo => `${ownerAndRepo[0]}/${ownerAndRepo[1]}` === keyToUpdate
        );

        if (
            !Array.isArray(ownerAndRepo) || 
            ownerAndRepo.length !== 2 || 
            ownerAndRepo[0] == null || 
            ownerAndRepo[1] == null
        ) {
            return;
        }

        return;

        Promise.all([
            Github.calculateModel(...ownerAndRepo)
        ])
        .then((data) => {
            // TODO: do something with data
            const newModel = {...models};
            newModel[keyToUpdate] = getModel(data);
            setModels(newModel);
        })
        .catch(console.error);

    }, [keyToUpdate]);


    /**
     * JSX
     */
    return (
        <Container width={'50%'}>
            <Header />
            <Container>
                <label 
                    fontSize={'1em'} 
                    htmlFor={'github-url'}
                >
                    Enter a GitHub repo URL:
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
            {models && <Container mt={'2em'}>
                <Flex alignItems='center' flexDirection='column'>
                    {Object.entries(models).map(([key, model], idx) => {

                        const owner = key.split('/')[0];
                        const repo = key.split('/')[1];

                        return (
                        <ProductCard
                            key={idx}
                            owner={owner}
                            repo={repo}
                            directed={model.directed}
                            maintained={model.maintained}
                            issues={model.issues}
                            onClose={() => onClose(key)}
                        />);
                    })}
                </Flex>
            </Container>}
        </Container>
    );
}

export default App;