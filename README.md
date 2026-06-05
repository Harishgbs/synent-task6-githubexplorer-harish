# GitHub Profile Explorer

A modern, production-quality web application for exploring GitHub user profiles. Built with vanilla JavaScript and the GitHub REST API, featuring a glassmorphism dark theme, real-time search, and detailed profile analytics.

## Features

- **User Search** — Search any GitHub username and instantly view their profile
- **Profile Information** — Avatar, name, bio, location, company, followers, following, public repositories
- **Repository Explorer** — Browse recent repositories with star counts and language indicators
- **Profile Statistics** — Visual stat cards for repos, followers, following, and join date
- **Search History** — Persistent search history with per-item and clear-all options
- **Dark / Light Mode** — Theme toggle with localStorage persistence
- **Copy Profile Link** — One-click copy of the GitHub profile URL
- **Open on GitHub** — Direct link to the user's GitHub profile
- **Loading States** — Skeleton loaders with shimmer animation for smooth UX
- **Error Handling** — User not found, API errors, and network failures with descriptive messages
- **Responsive Design** — Mobile-first layout that adapts from phones to desktops
- **Accessibility** — Semantic HTML, ARIA labels, keyboard navigation, focus management

## Technologies Used

- **HTML5** — Semantic markup with ARIA accessibility
- **CSS3** — Custom properties, glassmorphism, CSS Grid, animations, responsive design
- **Vanilla JavaScript** — ES6+, Fetch API, async/await, localStorage, IIFE module pattern
- **GitHub REST API** — User and repository endpoints

## API Documentation

This app uses the [GitHub REST API](https://docs.github.com/en/rest) v3.

### Endpoints

| Endpoint | Description |
|---|---|
| `GET /users/{username}` | Fetch user profile information |
| `GET /users/{username}/repos?sort=updated&per_page=10` | Fetch the 10 most recently updated repositories |

### Rate Limiting

Unauthenticated requests are limited to 60 requests per hour. For higher limits, GitHub recommends using a personal access token via the `Authorization` header.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Harishgbs/synent-task6-githubexplorer-harish.git
   ```

2. Open the project folder:
   ```bash
   cd synent-task6-githubexplorer-harish
   ```

3. Open `index.html` in your browser:
   ```bash
   open index.html
   ```

No build tools or dependencies required.

## Deployment

### GitHub Pages

1. Push the repository to GitHub
2. Go to **Settings > Pages**
3. Select the `master` branch as the source
4. The app will be available at `https://harishgbs.github.io/synent-task6-githubexplorer-harish/`

### Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project root
3. Follow the prompts to deploy

## Testing Checklist

- [x] Valid user search (e.g. `octocat`, `torvalds`)
- [x] Invalid user search (e.g. `thisuserdoesnotexist12345`)
- [x] Empty search submission
- [x] Mobile responsiveness (320px - 768px)
- [x] API rate limit handling
- [x] Network failure (offline mode)
- [x] Dark / light mode toggle
- [x] Search history persistence
- [x] Copy profile link to clipboard
- [x] Keyboard navigation

## Commit History

| # | Message |
|---|---|
| 1 | Initialize GitHub explorer project structure |
| 2 | Implement GitHub API integration and search functionality |
| 3 | Add repository display and profile statistics |
| 4 | Enhance UI responsiveness and error handling |
| 5 | Finalize project documentation and deployment readiness |

## Project Structure

```
├── index.html          # Main HTML document
├── css/
│   └── style.css       # Stylesheet with glassmorphism theme
├── js/
│   └── app.js          # Application logic (API, UI, state)
├── assets/
│   └── .gitkeep        # Placeholder for assets
└── README.md           # Project documentation
```
