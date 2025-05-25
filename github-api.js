// GitHub API integration for Arun Raj Peddhala

const GITHUB_USERNAME = "arunraj18"; // Arun's GitHub username
const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';

function createGitHubHeaders() {
    return {
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
    };
}

async function fetchWithCors(url, options = {}) {
    const headers = {
        ...createGitHubHeaders(),
        ...(options.headers || {})
    };

    const requestOptions = {
        ...options,
        headers,
        mode: 'cors',
        credentials: 'omit',
        cache: 'default'
    };

    try {
        let response = await fetch(url, requestOptions);
        if (!response.ok && response.type === 'opaque') {
            console.log('Direct CORS request failed, trying with proxy...');
            response = await fetch(`${CORS_PROXY}${url}`, {
                ...requestOptions,
                headers: {
                    ...requestOptions.headers,
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
        }
        return response;
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
}

async function fetchUserRepositories(username, count = 10) {
    const apiUrl = `https://api.github.com/users/${username}/repos?per_page=${count}&sort=updated`;
    console.log(`Fetching repositories from: ${apiUrl}`);

    try {
        const response = await fetchWithCors(apiUrl, { method: 'GET' });
        if (!response.ok) {
            const errorText = await response.text();
            let errorData;
            try {
                errorData = JSON.parse(errorText);
            } catch (e) {
                errorData = { message: errorText };
            }
            return JSON.stringify({ error: true, status: response.status, message: errorData.message });
        }

        const reposData = await response.json();
        const processedRepos = reposData.map(repo => ({
            name: repo.name,
            description: repo.description,
            language: repo.language,
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            updated_at: new Date(repo.updated_at).toLocaleString(),
            url: repo.html_url
        }));

        return JSON.stringify(processedRepos);
    } catch (error) {
        return JSON.stringify({ error: true, message: error.message });
    }
}

async function fetchLatestCommitsFromGitHub(username, repoName, count = 3) {
    const apiUrl = `https://api.github.com/repos/${encodeURIComponent(username)}/${encodeURIComponent(repoName)}/commits?per_page=${count}`;
    console.log(`Fetching commits from: ${apiUrl}`);

    try {
        const response = await fetchWithCors(apiUrl, { method: 'GET' });
        if (!response.ok) {
            const errorText = await response.text();
            let errorData;
            try {
                errorData = JSON.parse(errorText);
            } catch (e) {
                errorData = { message: errorText };
            }
            return JSON.stringify({ error: true, status: response.status, message: errorData.message });
        }

        const commitsData = await response.json();
        const processedCommits = commitsData.map(commitEntry => ({
            sha: commitEntry.sha.substring(0, 7),
            message: commitEntry.commit.message.split('\n')[0],
            author: commitEntry.commit.author.name,
            date: new Date(commitEntry.commit.author.date).toLocaleString(),
            url: commitEntry.html_url
        }));

        return JSON.stringify(processedCommits);
    } catch (error) {
        return JSON.stringify({ error: true, message: error.message });
    }
}

async function fetchUserContributionSummary(username, repoLimit = 5) {
    try {
        const reposResponse = await fetchUserRepositories(username, repoLimit);
        const repos = JSON.parse(reposResponse);

        if (repos.error) {
            return reposResponse;
        }

        const repoPromises = repos.map(async repo => {
            if (!repo || !repo.name) return null;

            let recentCommits = [];
            try {
                const commitsResponse = await fetchLatestCommitsFromGitHub(username, repo.name, 3);
                const parsedCommits = JSON.parse(commitsResponse);
                if (!parsedCommits.error && Array.isArray(parsedCommits)) {
                    recentCommits = parsedCommits;
                }
            } catch {}

            return {
                repository: repo.name,
                description: repo.description || 'No description',
                language: repo.language || 'Not specified',
                stars: repo.stars || 0,
                forks: repo.forks || 0,
                recent_commits: recentCommits,
                last_updated: repo.updated_at || new Date().toISOString(),
                url: repo.url || `https://github.com/${username}/${repo.name}`
            };
        });

        const contributionSummary = await Promise.all(repoPromises);
        const filteredSummary = contributionSummary.filter(repo => repo !== null);

        return JSON.stringify({
            username: username,
            total_repositories: repos.length,
            contribution_summary: filteredSummary
        });

    } catch (error) {
        return JSON.stringify({ error: true, status: 500, message: error.message });
    }
}

if (typeof window !== 'undefined') {
    window.githubApi = {
        get_latest_github_commits_for_user: fetchLatestCommitsFromGitHub,
        get_user_repositories: fetchUserRepositories,
        get_user_contribution_summary: fetchUserContributionSummary
    };
}

console.log('GitHub API Client initialized for Arun Raj Peddhala');