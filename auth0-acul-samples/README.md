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
