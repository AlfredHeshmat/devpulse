import { useState } from "react";
import "./App.css";
import { FaGithub } from "react-icons/fa";

function App() {
  const [username, setUsername] = useState("");
  const [user, setUser] = useState(null);
  const [repos, setRepos] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [repoSearch, setRepoSearch] = useState("");
  const [darkMode, setDarkMode] = useState(true);

  const searchUser = async () => {
    if (!username.trim()) {
      setError("Please enter a GitHub username");
      return;
    }

    setError("");
    setUser(null);
    setRepos([]);
    setRepoSearch("");
    setLoading(true);

    try {
      const userResponse = await fetch(
        `https://api.github.com/users/${username}`
      );

      if (!userResponse.ok) {
        throw new Error("GitHub user not found");
      }

      const userData = await userResponse.json();
      setUser(userData);

      const repoResponse = await fetch(
        `https://api.github.com/users/${username}/repos`
      );

      const repoData = await repoResponse.json();
      setRepos(repoData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const totalStars = repos.reduce(
    (sum, repo) => sum + repo.stargazers_count,
    0
  );

  const topRepo =
    repos.length > 0
      ? repos.reduce((best, repo) =>
          repo.stargazers_count > best.stargazers_count ? repo : best
        )
      : null;

  const languageCount = repos.reduce((acc, repo) => {
    if (repo.language) {
      acc[repo.language] = (acc[repo.language] || 0) + 1;
    }
    return acc;
  }, {});

  const mostUsedLanguage =
    Object.keys(languageCount).length > 0
      ? Object.entries(languageCount).sort((a, b) => b[1] - a[1])[0][0]
      : "N/A";

  const filteredRepos = repos
    .filter((repo) =>
      repo.name.toLowerCase().includes(repoSearch.toLowerCase())
    )
    .sort((a, b) => b.stargazers_count - a.stargazers_count);

  return (
    <div className={darkMode ? "app dark" : "app light"}>
      <h1>
        <FaGithub /> DevPulse
      </h1>

      <p className="subtitle">Search any GitHub developer profile</p>

      <button className="theme-btn" onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? "Light Mode" : "Dark Mode"}
      </button>

      <div className="search-box">
        <input
          type="text"
          placeholder="Enter GitHub username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") searchUser();
          }}
        />

        <button onClick={searchUser}>
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {loading && <div className="spinner"></div>}
      {error && <p className="error">{error}</p>}

      {user && (
        <div className="profile-card">
          <img src={user.avatar_url} alt={user.login} />

          <h2>{user.name || user.login}</h2>
          <p>@{user.login}</p>
          <p>{user.bio || "No bio available"}</p>

          <a
            href={user.html_url}
            target="_blank"
            rel="noreferrer"
            className="github-btn"
          >
            View GitHub Profile
          </a>

          <div className="stats">
            <div className="stat">
              <h3>{user.followers}</h3>
              <p>Followers</p>
            </div>

            <div className="stat">
              <h3>{user.following}</h3>
              <p>Following</p>
            </div>

            <div className="stat">
              <h3>{user.public_repos}</h3>
              <p>Repositories</p>
            </div>
          </div>
        </div>
      )}

      {repos.length > 0 && (
        <div className="profile-card">
          <h2>Developer Insights</h2>

          <div className="stats">
            <div className="stat">
              <h3>{totalStars}</h3>
              <p>Total Stars</p>
            </div>

            <div className="stat">
              <h3>{mostUsedLanguage}</h3>
              <p>Main Language</p>
            </div>
          </div>

          {topRepo && (
            <p>
              Top Repository: <strong>{topRepo.name}</strong>
            </p>
          )}
        </div>
      )}

      {repos.length > 0 && (
        <div className="profile-card">
          <h2>Top Repositories</h2>

          <input
            type="text"
            placeholder="Filter repositories..."
            value={repoSearch}
            onChange={(e) => setRepoSearch(e.target.value)}
            className="repo-search"
          />

          {filteredRepos.length > 0 ? (
            filteredRepos.slice(0, 5).map((repo) => (
              <div key={repo.id} className="repo-item">
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className="repo-link"
                >
                  {repo.name}
                </a>

                <p>⭐ {repo.stargazers_count}</p>
                <p>{repo.language || "No language listed"}</p>
                <p>
                  Updated: {new Date(repo.updated_at).toLocaleDateString()}
                </p>
              </div>
            ))
          ) : (
            <p>No repositories match your search.</p>
          )}
        </div>
      )}

      <footer>Built with React + GitHub API</footer>
    </div>
  );
}

export default App;