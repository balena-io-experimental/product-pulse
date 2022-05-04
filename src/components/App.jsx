import React, { useEffect, useState } from 'react';
import { Input, Container, Divider, Txt, Box, Flex } from 'rendition';
import { useDebounce } from 'use-debounce';

import Header from './Header';
import ProductCard from './ProductCard';
import { isGitHubUri } from '../validation';
import * as Github from '../github';
import { INVALID_URI, URI_DOES_NOT_EXIST } from '../errors';
import { getNMonthsAgo } from '../utils';
import { getModel } from '../model';

const App = () => {
    /**
     * STATE
     */
    const [input, setInput] = useState('');
    // Only validate and search after change events stop firing on input
    const [uri] = useDebounce(input, 1000);
    const [ownerAndRepo, setOwnerAndRepo] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [model, setModel] = useState(null);

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
        // isAccessibleRepo won't throw (with current implementation) so no need to wrap in try/catch
        const isAccessible = await Github.isAccessibleRepo(owner, repo);
        if (!isAccessible) {
            setErrorMessage(URI_DOES_NOT_EXIST);
            return false;
        }

        setErrorMessage('');
        setOwnerAndRepo([owner, repo]);
        return true;
    }

    const onClose = async () => {
        setInput('');
        setOwnerAndRepo(null);
        setErrorMessage('');
        setModel(null);
    }

    useEffect(() => {
        if (!uri) {
            return;
        }

        updateMessage(uri);
    }, [uri]);

    useEffect(() => {
        if (
            !Array.isArray(ownerAndRepo) || 
            ownerAndRepo.length !== 2 || 
            ownerAndRepo[0] == null || 
            ownerAndRepo[1] == null
        ) {
            return;
        }

        Promise.all([
            Github.getIssueCount(...ownerAndRepo),
            Github.getIssueCount(...ownerAndRepo, getNMonthsAgo(1)),
            Github.getPullRequestCount(...ownerAndRepo, getNMonthsAgo(1))
        ])
        .then(([issuesAllTime, issuesLastMonth, pullRequestsLastMonth]) => {
            // TODO: do something with data
            console.log({ issuesAllTime, issuesLastMonth, pullRequestsLastMonth });
            setModel(getModel(issuesAllTime, issuesLastMonth, pullRequestsLastMonth));
        })
        .catch(console.error);

    }, [ownerAndRepo]);


    /**
     * JSX
     */
    return (
        <Container>
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
            {model && <Container mt={'2em'}>
                <Flex justifyContent='center'>
                    <ProductCard 
                        owner={ownerAndRepo[0]}
                        repo={ownerAndRepo[1]}
                        directed={model.directed}
                        maintained={model.maintained}
                        issues={model.issues}
                        onClose={onClose}
                    />
                </Flex>
            </Container>}
        </Container>
    );
}

export default App;