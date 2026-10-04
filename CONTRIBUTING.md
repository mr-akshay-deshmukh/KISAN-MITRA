# Contributing to KisanMitra 🌾

Thank you for your interest in contributing to **KisanMitra**! Our mission is to empower farmers across India by providing transparent market access, AI diagnostics, and optimized logistics.

By participating in this project, you agree to abide by the [Code of Conduct](CODE_OF_CONDUCT.md).

---

## 🧭 Code of Conduct

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing to foster an open, welcoming, and inclusive community.

---

## 🛠️ How to Contribute

### 1. Reporting Bugs
- Check the [Issues tab](https://github.com/your-username/kisanmitra-agri-marketplace/issues) to ensure the bug hasn't already been reported.
- If it hasn't, open a new issue using our **Bug Report** template.
- Provide a clear, reproducible test case along with OS, browser version, and screenshots if applicable.

### 2. Suggesting Features
- Open an issue using the **Feature Request** template.
- Explain the rationale, target user (Farmer, FPO, Mart Buyer), and proposed implementation or UX workflow.

### 3. Submitting Pull Requests (PRs)
1. **Fork** the repository and clone your fork locally:
   ```bash
   git clone https://github.com/<your-username>/kisanmitra-agri-marketplace.git
   cd kisanmitra-agri-marketplace
   ```
2. **Create a topic branch** from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   # or
   git checkout -b fix/issue-description
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Make your changes**:
   - Write clean, type-safe TypeScript code.
   - Follow Tailwind CSS utility patterns for responsive UI.
   - Do not introduce inline styles or separate CSS files.
5. **Verify code quality**:
   ```bash
   npm run lint
   npm run build
   ```
6. **Commit your changes** using Conventional Commits:
   ```bash
   git commit -m "feat(marketplace): Add real-time price trend sparkline"
   ```
7. **Push to your fork**:
   ```bash
   git push origin feat/your-feature-name
   ```
8. **Open a Pull Request** against the `main` branch.

---

## 📜 Commit Conventions

We follow the [Conventional Commits specification](https://www.conventionalcommits.org/):

- `feat:` A new feature for the user
- `fix:` A bug fix
- `docs:` Documentation changes only
- `style:` Formatting, missing semi-colons, etc. (no functional code changes)
- `refactor:` Code refactoring with no behavioral changes
- `perf:` Performance improvements
- `test:` Adding or updating tests
- `chore:` Maintenance tasks, dependency bumps, configuration changes

*Example*:
`feat(ai-doctor): Add Marathi audio translation for pest remedies`

---

## 🧪 Development Guidelines

- **TypeScript Strictness**: Avoid `any` wherever possible. Define reusable models in `src/types/index.ts`.
- **Localization (i18n)**: When adding user-facing copy, include support for English, Marathi (`mr`), and Hindi (`hi`).
- **No Direct Secrets**: Never expose API keys or credentials in client bundles. Route all sensitive third-party API calls through backend endpoints in `server.ts`.
- **Accessibility**: Ensure buttons have clear `aria-label` or visible text, and touch targets are at least 44×44px for field-based mobile usage.

---

## 💬 Getting Help

If you have questions or need assistance, feel free to open a Discussion on GitHub or reach out to the core engineering team at `engineeringstudies5@gmail.com`.

Happy coding! जय जवान, जय किसान!
