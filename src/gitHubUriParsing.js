const GH_OWNER_REPO_BASE = /([\w\-\_~]+)/.source;

// Matches:
// - Simple owner/repo format, i.e. balena-io-playground/product-pulse
const OWNER_REPO_REGEX = 
    new RegExp(`^${GH_OWNER_REPO_BASE}\/${GH_OWNER_REPO_BASE}$`);

// Matches:
// - SSH git URL, i.e. git@github.com:balena-io-playground/product-pulse.git
// - HTTPS git URL, i.e. https://github.com/balena-io-playground/product-pulse.git
// - HTTPS URL, i.e. https://github.com/balena-io-playground/product-pulse
const GITHUB_URL_REGEX = 
    new RegExp(`(?:https:\/\/|git\@)github\.com(?:\:|\/)${GH_OWNER_REPO_BASE}\/${GH_OWNER_REPO_BASE}(?:\.git)?`);

/**
 * Given any string, check whether it's a valid GitHub URI (see OWNER_REPO_REGEX and GITHUB_URL_REGEX)
 * @param {string} string 
 * @returns true | never
 */
const ensureGitHubURI = (string) => {
    const isValid = OWNER_REPO_REGEX.test(string) || GITHUB_URL_REGEX.test(string);
    if (!isValid) {
        throw new Error(`isGitHubUri: Expected GitHub URI of format ${OWNER_REPO_REGEX.source} or ${GITHUB_URL_REGEX.source}, got '${string}'`);
    }
};

/**
 * Given a valid GitHub URI, return its owner and repository
 * @param {string} gitHubUri 
 * @returns {Array[string, string]}
 */
export const getOwnerAndRepo = (gitHubUri) => {
    ensureGitHubURI(gitHubUri);

    const matchingRegex = OWNER_REPO_REGEX.test(gitHubUri) ? 
        OWNER_REPO_REGEX : 
        GITHUB_URL_REGEX;

    const [, owner, repo] = gitHubUri.match(matchingRegex);
    return [owner, repo];
}