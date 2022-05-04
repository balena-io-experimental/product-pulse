const GH_OWNER_REPO_BASE = /([\w\-\_~]+)/.source;

// Matches:
// - Simple owner/repo format, i.e. balena-io-playground/product-pulse
export const OWNER_REPO_REGEX = 
    new RegExp(`^${GH_OWNER_REPO_BASE}\/${GH_OWNER_REPO_BASE}$`);

// Matches:
// - SSH git URL, i.e. git@github.com:balena-io-playground/product-pulse.git
// - HTTPS git URL, i.e. https://github.com/balena-io-playground/product-pulse.git
// - HTTPS URL, i.e. https://github.com/balena-io-playground/product-pulse
export const GITHUB_URL_REGEX = 
    new RegExp(`(?:https:\/\/|git\@)github\.com(?:\:|\/)${GH_OWNER_REPO_BASE}\/${GH_OWNER_REPO_BASE}(?:\.git)?`);

/**
 * Given any string, check whether it's a valid GitHub URI (see OWNER_REPO_REGEX and GITHUB_URL_REGEX)
 * @param {string} string 
 * @returns true | never
 */
export const isGitHubUri = (string) => {
    const isValid = OWNER_REPO_REGEX.test(string) || GITHUB_URL_REGEX.test(string);
    if (!isValid) {
        console.error(`isGitHubUri: Expected GitHub URI of format ${OWNER_REPO_REGEX.source} or ${GITHUB_URL_REGEX.source}, got '${string}'`);
    }
    return isValid;
};

const GITHUB_DATE_REGEX = /^[0-9]{4}\-[0-9]{2}\-[0-9]{2}$/;

/**
 * Checks whether input string is of the date format YYYY-MM-DD
 * @param {string} string 
 * @returns true | never
 */
export const isValidGitHubQueryDate = (string) => {
    const isValid = GITHUB_DATE_REGEX.test(string);
    if (!isValid) {
        console.error(`Expected valid date of format YYYY-MM-DD, got '${string}'`);
    }
    return isValid;
}
