# Contributing to TripMate

First off, thank you for considering contributing to TripMate! It's people like you that make open-source projects such a great community.

## 1. Branching Strategy

We use a simple branching model to keep the `main` branch stable:

- **`main`** — The stable, production-ready branch. Do not commit directly here.
- **`feature/feature-name`** — For adding new features (e.g., `feature/trip-crud`).
- **`chore/task-name`** — For maintenance, config, or documentation (e.g., `chore/ci-setup`).
- **`release/vX.Y.Z`** — For preparing a new release.

**Workflow:**
1. Branch off from `main`.
2. Make your changes and commit them.
3. Push your branch and open a Pull Request (PR).
4. Once reviewed and merged, your changes will be in `main`.

## 2. Commit Message Convention

We follow the **Conventional Commits** format for all commit messages. This helps keep our Git history readable and makes it easier to generate release notes.

**scope:**
**Allowed Types:**
- `feat` — A new feature
- `fix` — A bug fix
- `docs` — Documentation only changes
- `style` — Changes that do not affect the meaning of the code (white-space, formatting, etc.)
- `refactor` — A code change that neither fixes a bug nor adds a feature
- `test` — Adding missing tests or correcting existing tests
- `chore` — Changes to the build process or auxiliary tools
- `ci` — Changes to CI/CD configuration

**Examples:**
- `feat(server): add JWT authentication middleware`
- `fix(client): correct login redirect issue`
- `docs: update API documentation`
- `chore: add root .gitignore`

## 3. Code Style

- Use **2 spaces** for indentation.
- We use **Prettier** to format our code. Please make sure your editor is using the `.prettierrc` rules defined in the root.
- **ESLint** rules are also enforced. Run `npm run lint` (if configured) before committing.

## 4. Pull Request Process

1. Ensure your code builds and all tests pass locally (`npm test` in the `server` folder).
2. Update the `README.md` or `docs/` with details of changes, if applicable.
3. Fill out the Pull Request template completely.
4. PRs will be reviewed by the maintainer (mystack01). Please be patient.
5. Do not merge your own PRs unless explicitly permitted.