import { Octokit } from '@octokit/rest';
// This is imported to throttle requests, but isn't used directly - see plugin-throttling docs for example
import { throttling } from '@octokit/plugin-throttling';

import * as validation from './validation';

/**
 * Setup GitHub REST API client
 */
const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
    userAgent: 'ProcessPulse v1.0.0',
    throttle: {
        onRateLimit: (retryAfter, options) => {
            octokit.log.warn(
                `Request quota exhausted for request ${options.method} ${options.url}`
            );
            
            // Retry twice after hitting a rate limit error, then give up.
            // Don't retry with stale requests older than 5 seconds.
            if (options.request.retryCount <= 2 && retryAfter <= 5) {
                console.log(`Retrying after ${retryAfter} seconds!`);
                return true;
            }
        },
        onAbuseLimit: (_retryAfter, options) => {
            // does not retry, only logs a warning
            octokit.log.warn(
                `Abuse detected for request ${options.method} ${options.url}`
            );
        }
    }
});

/**
 * Given a valid GitHub URI, return its owner and repository
 * @param {string} gitHubUri 
 * @returns {Array[string, string]}
 */
 export const getOwnerAndRepo = (gitHubUri) => {
    if (!validation.isGitHubUri(gitHubUri)) {
        return;
    }

    const matchingRegex = validation.OWNER_REPO_REGEX.test(gitHubUri) ? 
        validation.OWNER_REPO_REGEX : 
        validation.GITHUB_URL_REGEX;

    const [, owner, repo] = gitHubUri.match(matchingRegex);
    return [owner, repo];
}

/**
 * Given a GitHub owner and repo, check whether repo is accessible/exists.
 * @param {string} owner
 * @param {string} repo 
 * @returns {boolean}
 */
export const isAccessibleRepo = async (owner, repo) => {
    try {
        const response = await octokit.rest.repos.get({
            owner,
            repo
        });
        return response.status === 200;
    } catch (e) {
        return false;
    }
}

/**
 * Given a GitHub owner and repo, return a count of issues categorized by open & closed.
 * @param {string} owner 
 * @param {string} repo
 * @param {string} [updated] YYYY-MM-DD format date to filter for issues updated newer than date.
 *                           Issues created newer than this date are also considered updated at this date.
 * @returns {Object}: An object with 'closed' and 'open' keys and numeric values
 */
export const getIssueCount = async (owner, repo, updated) => {
    if (updated && !validation.isValidGitHubQueryDate(updated)) {
        return;
    }

    try {
        const queryBase = `type:issue repo:${owner}/${repo}`;
        // Minimize data fetched to speed up query
        const optionsBase = { page: 0, per_page: 1 };

        const { data: { total_count: closed }} = await octokit.search.issuesAndPullRequests({
            q: `${queryBase} is:closed${updated ? ` updated:>=${updated}` : ''}`,
            ...optionsBase
        });

        const { data: { total_count: open }} = await octokit.search.issuesAndPullRequests({
            q: `${queryBase} is:open${updated ? ` updated:>=${updated}` : ''}`,
            ...optionsBase
        });

        return { closed, open };
    } catch (e) {
        console.error('Received error in getIssueCount: ', e);
        throw e;
    }
}


export const getPullRequestCount = async (owner, repo, updated) => {
    if (updated && !validation.isValidGitHubQueryDate(updated)) {
        return;
    }

    try {
        const queryBase = `type:pr repo:${owner}/${repo}`;
        // Minimize data fetched to speed up query
        const optionsBase = { page: 0, per_page: 1 };

        const { data: { total_count: closed }} = await octokit.search.issuesAndPullRequests({
            q: `${queryBase} is:closed${updated ? ` updated:>=${updated}` : ''}`,
            ...optionsBase
        });
        const { data: { total_count: open }} = await octokit.search.issuesAndPullRequests({
            q: `${queryBase} is:open${updated ? ` updated:>=${updated}` : ''}`,
            ...optionsBase
        });

        return { closed, open };
    } catch (e) {
        console.error('Received error in getPullRequestCount: ', e);
        throw e;
    }
}
