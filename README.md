# PhraseSnap

A fast and simple notes application built with Astro and React.

## 🚀 Features

- 📝 Create and manage notes
- 🏷️ Organize notes with subgroups
- 🔍 Search functionality
- 🌙 Dark/Light theme support
- 📱 Responsive design
- 🔐 Supabase authentication
- 💾 Offline support with localStorage

## 🛠️ Tech Stack

- **Frontend**: Astro, React, Tailwind CSS
- **Backend**: Supabase
- **Deployment**: GitHub Pages

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

1. Clone the repository:
```sh
git clone https://github.com/yourusername/phrasesnap.git
cd phrasesnap
```

2. Install dependencies:
```sh
npm install
```

3. Start the development server:
```sh
npm run dev
```

4. Open [http://localhost:4321](http://localhost:4321) in your browser.

## 📦 Build & Deployment

### Local Build

```sh
npm run build
npm run preview
```

### GitHub Pages Deployment

The project is configured for automatic deployment to GitHub Pages when pushing to the `main` branch.

#### Setup GitHub Secrets

Before deploying, you need to configure the following secrets in your GitHub repository:

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Add the following secrets:

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

#### Enable GitHub Pages

1. Go to your repository **Settings** → **Pages**
2. Under **Source**, select **GitHub Actions**

#### Update Repository URL

Update the `site` URL in `astro.config.mjs` with your actual GitHub username:

```javascript
site: process.env.GITHUB_ACTIONS ? 'https://YOUR_USERNAME.github.io' : undefined,
```

## 📁 Project Structure

```text
/
├── public/
│   ├── favicon.svg
│   ├── manifest.json
│   └── sw.js
├── src/
│   ├── components/
│   │   ├── App.jsx
│   │   ├── Auth.jsx
│   │   ├── NoteList.jsx
│   │   └── ...
│   ├── layouts/
│   │   └── Layout.astro
│   ├── pages/
│   │   └── index.astro
│   ├── styles/
│   │   └── global.css
│   └── utils/
│       ├── storage.js
│       └── supabase.js
├── .github/
│   └── workflows/
│       └── deploy.yml
└── package.json
```

## 🧞 Commands

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
