# Auth0 Advanced Customizations for Universal Login Samples

This monorepo provides production-ready templates for creating custom Auth0 Advanced Customizations for Universal Login (ACUL) screens. Each sample demonstrates different implementation approaches and SDK integrations while following Auth0's design language and user experience patterns.

**What is ACUL?** Advanced Customizations for Universal Login (ACUL) allows you to build custom, client-rendered versions of Universal Login screens, giving you complete control over your authentication experience. ACUL uses a client/server model where you have full control over the client-side interface while leveraging the security, extensibility, and flexibility of Universal Login's hosted authentication on the server side.

> **⚠️ Important Notes**
>
> - **Enterprise Feature**: Requires Enterprise Auth0 plan and verified custom domain

## Available Samples

### [React-JS Sample](./react-js/)
- **SDK**: Auth0 ACUL JS SDK (`@auth0/auth0-acul-js`)
- **Screens**: 3 authentication screens
  - Login (universal login)
  - Login-ID (identifier-first flow)
  - Login-Password (password entry)
- **Tech Stack**: React 19, TypeScript, Vite, Tailwind CSS
- **Development**: Integrated context inspector for real-time debugging

<table>
  <tr>
    <td width="50%" align="center">
      <img 
        src="https://cdn.auth0.com/website/acul-samples/login-id-with-ulx-context.png" 
        alt="Login ID Screen with mock data"
        width="100%" />
      <br />
      <sub><em>Login-id screen local development with ul-context-inspector</em></sub>
    </td>
    <td width="50%" align="center">
      <img 
        src="https://cdn.auth0.com/website/acul-samples/login-id-prod.png" 
        alt="Login ID Screen deployed with ACUL"
        width="100%" />
      <br />
      <sub><em>Login-id screen production deployment with ACUL</em></sub>
    </td>
  </tr>
</table>


### [React Sample](./react/)
- **SDK**: Auth0 ACUL React SDK (`@auth0/auth0-acul-react`)
- **Screens**: 31 authentication screens
  - **Login & Authentication (5)**: Login, Login-ID, Login-Password, Login-Passwordless-Email-Code, Login-Passwordless-SMS-OTP
  - **Signup & Registration (3)**: Signup, Signup-ID, Signup-Password
  - **Password Reset (4)**: Reset-Password-Request, Reset-Password-Email, Reset-Password, Reset-Password-Error
  - **Multi-Factor Authentication (15)**: MFA-Begin-Enroll-Options, MFA-Country-Codes, MFA-Email-Challenge, MFA-Email-List, MFA-Enroll-Result, MFA-Login-Options, MFA-Push-Challenge-Push, MFA-Push-Enrollment-QR, MFA-Push-List, MFA-Push-Welcome, MFA-SMS-Challenge, MFA-SMS-Enrollment, MFA-SMS-List, MFA-WebAuthn-Platform-Challenge, MFA-WebAuthn-Platform-Enrollment
  - **Passkeys (2)**: Passkey-Enrollment, Passkey-Enrollment-Local
  - **Identifier Management (2)**: Email-Identifier-Challenge, Phone-Identifier-Challenge
- **Tech Stack**: React 19, TypeScript, Vite, Tailwind CSS
- **Development**: Integrated context inspector for real-time debugging

<table>
  <tr>
    <td width="50%" align="center">
      <img 
        src="https://cdn.auth0.com/website/acul-samples/signup-with-ulx-context.png" 
        alt="Signup Screen with mock data"
        width="100%" />
      <br />
      <sub><em>Signup screen local development with ul-context-inspector</em></sub>
    </td>
    <td width="50%" align="center">
      <img 
        src="https://cdn.auth0.com/website/acul-samples/signup-prod.png" 
        alt="Signup Screen deployed with ACUL"
        width="100%" />
      <br />
      <sub><em>Signup screen production deployment with ACUL</em></sub>
    </td>
  </tr>
</table>

## Table of Contents

- [Quick Start](#quick-start)
- [Development with ul-context-inspector](#development-with-ul-context-inspector)
- [Prerequisites](#prerequisites)
- [Screens](#screens)
- [Build Structure](#build-structure)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Documentation](#documentation)
- [Troubleshooting](#troubleshooting)

<a id="quick-start"></a>

## Quick Start

### React-JS Sample (Auth0 ACUL JS SDK)

```bash
# Navigate to the React-JS sample
cd react-js

# Install dependencies
npm install

# Start development server with context inspector
npm run dev  # Opens http://localhost:3000
```

The development server includes an integrated context inspector that lets you visualize and edit the Auth0 Universal Login context in real-time, switch between screens, and test different scenarios.

<a id="development-with-ul-context-inspector"></a>

## Development with ul-context-inspector

`ul-context-inspector` is a developer panel that simulates Auth0's Universal Login context using local mock data, enabling development without an Enterprise Auth0 tenant.

**How it works:**
- **Development**: Loads mock JSON from `public/screens/` → No Auth0 connection needed
- **Production**: Uses real Auth0 context from `window.universal_login_context`

### Creating Local Mocks

1. Add screen mocks in `public/screens/{prompt}/{screen}/`:
   - `default.json` - Default state
   - `with-errors.json` - Error state

2. Register in `public/manifest.json`:
```json
{
  "versions": ["v2", "v0"],
  "screens": [
    {
      "login": {
        "login": {
          "path": "/screens/login/login",
          "variants": ["default", "with-errors"]
        }
      }
    }
  ]
}
```

3. Run `npm run dev` - screens appear in the inspector automatically!

<a id="prerequisites"></a>

## Prerequisites

**For Local Development:**

- Node.js version 22+ (`node -v` to check)

**For Production Use:**

- Auth0 tenant with verified custom domain
- Enterprise Auth0 plan (for ACUL access)

> **Open Source Contributors:** You can explore and contribute to this codebase without needing an Auth0 Enterprise plan using the development context inspector.

<details>
<summary>Need to install Node.js?</summary>

We recommend using NVM (Node Version Manager):

- macOS/Linux: `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash`
- Windows: Install [nvm-windows](https://github.com/coreybutler/nvm-windows)

```bash
nvm install 22
nvm use 22
```

</details>

### Testing with Real Auth0

Once you're ready to test with actual Auth0 authentication:

```bash
# Navigate to the React-JS sample
cd react-js

# Build and serve assets locally
npm run build
npx serve dist -p 8080 --cors

# Install Auth0 CLI and configure (Enterprise tenants only)
npm install -g @auth0/auth0-cli
auth0 login

# Configure ACUL with settings file
auth0 ul customize --rendering-mode advanced --prompt login-id --screen login-id --settings-file ./settings.json
```

**About settings.json:** This file contains the same ACUL payload configuration as shown in the [Build Structure](#build-structure) section. It defines how Auth0 should load your custom screen assets, including CSS files, JavaScript bundles, and context configuration. The settings.json file structure is identical to the payload you'd use when configuring ACUL programmatically.

> **⚠️ Use development/testing tenants only**

<a id="screens"></a>

## Screens

The main screen implementations are located in:

- **React-JS Sample**: [`react-js/src/screens/`](./react-js/src/screens/) - 3 screens
- **React Sample**: [`react/src/screens/`](./react/src/screens/) - 31 screens

Each screen is designed to integrate with the [Auth0 ACUL SDK](https://github.com/auth0/universal-login).

<a id="build-structure"></a>

## Build Structure

**About manifest.json:** The `manifest.json` file at the project root defines the available templates and screens for the `auth0-cli` tool, enabling developers to scaffold projects with `auth0 acul init` by specifying which files and directories to include for each framework and screen combination.

Vite compiles each screen as a separate entry point for optimized loading:

```bash
# Navigate to the React or React-JS sample
cd react  # or cd react-js

# Build optimized assets
npm run build

# Serve locally for testing
npx serve dist -p 8080 --cors
```

**Output Structure:**

```
dist/
├── index.html                           # Main entry point
└── assets/
    ├── main.[hash].js                   # Main application bundle
    ├── shared/
    │   ├── style.[hash].css             # Global styles (Tailwind + Auth0 theme)
    │   ├── react-vendor.[hash].js       # React + ReactDOM (~324 kB)
    │   ├── vendor.[hash].js             # Third-party dependencies (~196 kB)
    │   └── common.[hash].js             # Shared app code (~87 kB)
    └── [screen-name]/
        └── index.[hash].js              # Screen-specific code (0.9-6 kB)
```

**Bundle Strategy:**
- **react-vendor**: Contains React and ReactDOM for better caching across deploys
- **vendor**: Contains all other third-party packages (captcha providers, utilities)
- **common**: Shared application code (components, hooks, utilities)
- **Screen bundles**: Only screen-specific logic, optimized for fast loading

Screen-specific bundles can be deployed independently for incremental rollouts.

<details>
<summary>ACUL Payload Configuration Example (settings.json)</summary>

When configuring Auth0 ACUL for a specific screen, your settings.json file will reference the built assets:

```json
{
  "rendering_mode": "advanced",
  "context_configuration": [
    "branding.settings",
    "branding.themes.default",
    "screen.texts"
  ],
  "default_head_tags_disabled": false,
  "head_tags": [
    {
      "tag": "base",
      "attributes": {
        "href": "https://your-cdn-domain.com/"
      }
    },
    {
      "tag": "meta",
      "attributes": {
        "name": "viewport",
        "content": "width=device-width, initial-scale=1"
      }
    },
    {
      "tag": "link",
      "attributes": {
        "rel": "stylesheet",
        "href": "https://your-cdn-domain.com/assets/shared/style.[hash].css"
      }
    },
    {
      "tag": "script",
      "attributes": {
        "src": "https://your-cdn-domain.com/assets/main.[hash].js",
        "type": "module"
      }
    },
    {
      "tag": "script",
      "attributes": {
        "src": "https://your-cdn-domain.com/assets/shared/react-vendor.[hash].js",
        "type": "module"
      }
    },
    {
      "tag": "script",
      "attributes": {
        "src": "https://your-cdn-domain.com/assets/shared/vendor.[hash].js",
        "type": "module"
      }
    },
    {
      "tag": "script",
      "attributes": {
        "src": "https://your-cdn-domain.com/assets/shared/common.[hash].js",
        "type": "module"
      }
    },
    {
      "tag": "script",
      "attributes": {
        "src": "https://your-cdn-domain.com/assets/login-id/index.[hash].js",
        "type": "module"
      }
    }
  ]
}
```

Reference these built assets in your Auth0 ACUL configuration.

</details>

<a id="deployment"></a>

## Deployment

### Automated Vercel Deployment Pipeline

This repository includes a complete CI/CD pipeline that automatically deploys your ACUL screens to Vercel and updates Auth0 configuration whenever you push to the `main` branch.

#### Purpose

The deployment pipeline solves several challenges:
1. **Automated Asset Hosting**: Builds and deploys React screens to Vercel with proper CORS headers
2. **File Hash Synchronization**: Automatically extracts file hashes from the live deployment and updates Auth0
3. **Zero Manual Configuration**: No need to manually update Auth0 with new file paths after each build
4. **CORS Support**: Ensures assets can be loaded cross-origin from Auth0 domains

#### How It Works

```
Push to GitHub → Build React App → Deploy to Vercel → Update Auth0 Config
```

1. **Build Stage**: GitHub Actions builds your React app with Vite, generating hashed assets
2. **Deployment Stage**: Deploys assets to Vercel with CORS headers (`Access-Control-Allow-Origin: *`)
3. **Sync Stage**: Fetches `index.html` from live Vercel URL, extracts file hashes, updates Auth0 via Management API

#### Setup Instructions

**1. Create Vercel Project**

```bash
# Navigate to react-js folder and build
cd auth0-acul-samples/react-js
npm install
npm run build

# Link to Vercel (creates new project)
cd dist
vercel link
```

When prompted:
- Choose your Vercel team/account
- Select **"No"** when asked to link to existing project
- Enter a **unique project name** (e.g., `acul-mycompany-167`)
- Confirm directory as `.` (current)

```bash
# Get your project details
cat .vercel/project.json
```

This outputs your `projectId` and `orgId` - save these for GitHub secrets.

> **⚠️ Important**: Use a **unique project name**. Vercel project names are globally unique, and reusing a name from a deleted project may inherit cached CORS headers from the previous owner.

**2. Get Vercel API Token**

1. Go to [Vercel Dashboard](https://vercel.com/account/tokens)
2. Click **"Create Token"**
3. Name it (e.g., `GitHub Actions - ACUL Deployment`)
4. Set scope to your team/account
5. Copy the token (you won't see it again)

**3. Get Auth0 Management API Token**

1. Go to your Auth0 Dashboard → Applications → APIs
2. Select **"Auth0 Management API"**
3. Go to **"Machine to Machine Applications"** tab
4. Authorize your application with these scopes:
   - `read:prompts`
   - `update:prompts`
5. Copy the token from your application settings

**4. Configure GitHub Secrets**

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Add these secrets:

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `VERCEL_TOKEN` | Vercel API token from step 2 | `v1a2b3c4d5e6f7g8h9i0...` |
| `VERCEL_ORG_ID` | From `.vercel/project.json` | `team_xxxxxxxxxxxxx` |
| `VERCEL_PROJECT_ID` | From `.vercel/project.json` | `prj_xxxxxxxxxxxxx` |
| `AUTH0_DOMAIN` | Your Auth0 tenant domain | `your-tenant.auth0.com` |
| `AUTH0_MGMT_TOKEN` | Management API token from step 3 | `eyJhbGciOiJSUzI1NiIs...` |

**5. Verify Workflow File**

The workflow is located at `.github/workflows/deploy-acul-vercel.yml`. Update the `VERCEL_URL` environment variable to match your Vercel project name:

```yaml
env:
  VERCEL_URL: "https://your-project-name.vercel.app"  # Update this
```

**6. Trigger Deployment**

```bash
# Make any change and push
git add .
git commit -m "Trigger deployment"
git push origin main
```

Monitor progress in **GitHub Actions** tab.

#### What the GitHub Action Does

The workflow (`.github/workflows/deploy-acul-vercel.yml`) performs these steps:

1. **📥 Checkout code**: Clones the repository
2. **🔧 Setup Node.js**: Installs Node.js 20
3. **📦 Install dependencies**: Runs `npm ci` in `react-js/` folder
4. **🧹 Clean dist folder**: Removes old build artifacts
5. **🏗️ Build ACUL assets**: Runs `npm run build` with Vite
6. **📄 Create vercel.json**: Generates configuration with CORS headers:
   ```json
   {
     "version": 2,
     "builds": [],
     "headers": [
       {
         "source": "/(.*)",
         "headers": [
           {"key": "Access-Control-Allow-Origin", "value": "*"},
           {"key": "Access-Control-Allow-Methods", "value": "GET, OPTIONS"}
         ]
       }
     ]
   }
   ```
7. **📁 Prepare clean deployment directory**: Copies `dist/*` to `deploy-temp/` (without `package.json`/`vite.config` to prevent Vercel from rebuilding)
8. **🚀 Install Vercel CLI**: Installs latest Vercel CLI globally
9. **🚢 Deploy to Vercel**: Runs `vercel deploy --prod` from `deploy-temp/`
10. **🔄 Update Auth0 Configuration**: Executes `scripts/update-auth0-vercel.js`:
    - Fetches `index.html` from live Vercel URL
    - Extracts file hashes via regex (e.g., `main.B3xD_vzY.js`)
    - Builds Auth0 configuration with `<script>` and `<link>` tags
    - PATCH request to Auth0 Management API: `/api/v2/prompts/login-id/screen/login-id/rendering`
11. **✅ Deployment Complete**: Shows success message with live URL

#### Verifying CORS Headers

After deployment, test that CORS headers are correctly set:

```powershell
# PowerShell
$response = Invoke-WebRequest -Uri 'https://your-project.vercel.app/assets/main.[hash].js' -Method Head
$response.Headers | Format-List
```

Look for:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, OPTIONS
```

#### Troubleshooting

**Issue: "Project not found" error**
- **Cause**: `VERCEL_PROJECT_ID` or `VERCEL_ORG_ID` secrets are incorrect
- **Solution**: Run `vercel link` again and update GitHub secrets with new values from `.vercel/project.json`

**Issue: Old CORS headers persist (wrong domain)**
- **Cause**: Vercel project name was reused and has cached configuration
- **Solution**: Delete Vercel project, create a new one with a unique name, update GitHub secrets

**Issue: Auth0 not updating**
- **Cause**: Invalid `AUTH0_MGMT_TOKEN` or missing API scopes
- **Solution**: Generate new Management API token with `read:prompts` and `update:prompts` scopes

**Issue: File hashes don't match**
- **Cause**: Script extracts hashes from wrong URL
- **Solution**: Verify `VERCEL_URL` in workflow matches your actual Vercel project URL

#### Manual Deployment (Alternative)

See [DEPLOYMENT.md](./react/DEPLOYMENT.md) for manual deployment instructions without GitHub Actions.

<details>
<summary>Enabling Screens for Deployment</summary>

Control which screens are deployed by modifying [`react/.github/config/deploy_config.yml`](./react/.github/config/deploy_config.yml):

```yaml
default_screen_deployment_status:
  "login-id": true # Enable for deployment
  "signup": false # Disable for deployment
```

</details>

<a id="contributing"></a>

## Contributing

We welcome contributions! Here's how you can help:

**Getting Started:**

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes using the development server: `npm run dev`
4. Test thoroughly: `npm test`
5. Submit a pull request

**What to Contribute:**

- Bug fixes and improvements
- Documentation updates
- Test coverage improvements
- Component enhancements

**Development Guidelines:**

- Follow the existing code patterns in `react-js/src/screens/` or `react/src/screens/`
- Use TypeScript for type safety
- Follow the Auth0 design system principles
- Include tests for new functionality
- Use `npm run dev` to start the development server with context inspector

<a id="documentation"></a>

## Documentation

- **[Auth0 ACUL Documentation](https://auth0.com/docs/customize/login-pages/advanced-customizations)** - Official ACUL guide

<a id="troubleshooting"></a>

## Troubleshooting

### Common Issues

<details>
<summary>Screen not loading or showing blank page</summary>

**Symptoms:** Browser shows blank page or loading spinner
**Solutions:**

1. Check browser console for JavaScript errors
2. Ensure all dependencies installed: `npm install`
3. Try clearing browser cache and restarting dev server: `npm run dev`
</details>

### Getting Help

- **Bug Reports:** [Create an issue](https://github.com/auth0-samples/auth0-acul-samples/issues/new) with reproduction steps
- **Community Discussion:** [Auth0 Community Forum](https://community.auth0.com/)
- **Documentation:** [Auth0 ACUL Docs](https://auth0.com/docs/customize/login-pages/advanced-customizations)
- **Feature Requests:** [Open a discussion](https://github.com/auth0-samples/auth0-acul-samples/discussions)
