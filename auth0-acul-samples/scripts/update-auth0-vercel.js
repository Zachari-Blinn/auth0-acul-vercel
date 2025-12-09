#!/usr/bin/env node

/**
 * Update Auth0 ACUL Configuration with Vercel Deployment
 * 
 * This script:
 * 1. Reads the built asset files and extracts hashes
 * 2. Constructs the Auth0 configuration
 * 3. Updates Auth0 via Management API
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
const AUTH0_TOKEN = process.env.AUTH0_MGMT_TOKEN;
const VERCEL_URL = process.env.VERCEL_URL;

// Screens to update
const SCREENS_TO_UPDATE = ['login-id']; // Add more screens as needed: ['login-id', 'signup', 'login-password']

// Validation
if (!AUTH0_DOMAIN || !AUTH0_TOKEN || !VERCEL_URL) {
  console.error('❌ Missing required environment variables:');
  console.error('   - AUTH0_DOMAIN:', AUTH0_DOMAIN ? '✓' : '✗');
  console.error('   - AUTH0_MGMT_TOKEN:', AUTH0_TOKEN ? '✓' : '✗');
  console.error('   - VERCEL_URL:', VERCEL_URL ? '✓' : '✗');
  process.exit(1);
}

console.log('🚀 Starting Auth0 configuration update...');
console.log('📍 Auth0 Domain:', AUTH0_DOMAIN);
console.log('🌐 Vercel URL:', VERCEL_URL);

// Function to extract hash from filename
function extractHash(files, pattern) {
  const file = files.find(f => f.includes(pattern));
  if (!file) {
    console.warn(`⚠️  Could not find file matching pattern: ${pattern}`);
    return null;
  }
  const match = file.match(/\.([a-zA-Z0-9_-]+)\.(js|css)$/);
  return match ? match[1] : null;
}

// Fetch the index.html from Vercel to extract actual deployed hashes
function getAssetHashesFromVercel(vercelUrl) {
  return new Promise((resolve, reject) => {
    const url = new URL(vercelUrl);
    
    const options = {
      hostname: url.hostname,
      path: '/',
      method: 'GET',
      headers: {
        'User-Agent': 'Auth0-ACUL-Updater/1.0'
      }
    };

    https.get(options, (res) => {
      let html = '';
      
      res.on('data', (chunk) => {
        html += chunk;
      });
      
      res.on('end', () => {
        console.log('📦 Fetched index.html from Vercel');
        resolve(html);
      });
    }).on('error', (error) => {
      console.error('❌ Failed to fetch from Vercel:', error.message);
      reject(error);
    });
  });
}

// Read built assets and extract hashes
function getAssetHashes() {
  const distPath = path.join(__dirname, '../react-js/dist/assets');
  
  if (!fs.existsSync(distPath)) {
    console.error('❌ Build directory not found:', distPath);
    console.error('   Run "npm run build:all" first!');
    process.exit(1);
  }

  // Get all files recursively
  const getAllFiles = (dirPath, arrayOfFiles = []) => {
    const files = fs.readdirSync(dirPath);

    files.forEach(file => {
      const filePath = path.join(dirPath, file);
      if (fs.statSync(filePath).isDirectory()) {
        arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
      } else {
        arrayOfFiles.push(path.relative(distPath, filePath));
      }
    });

    return arrayOfFiles;
  };

  const files = getAllFiles(distPath);
  
  console.log('📦 Found assets:', files.length);

  const hashes = {
    style: extractHash(files, 'shared/style.'),
    main: extractHash(files, 'main.'),
    loginId: extractHash(files, 'login-id/index.'),
    vendor: extractHash(files, 'shared/vendor.'),
    reactVendor: extractHash(files, 'shared/react-vendor.')
  };

  // Validate all required hashes are found
  const missingHashes = Object.entries(hashes)
    .filter(([key, value]) => !value)
    .map(([key]) => key);

  if (missingHashes.length > 0) {
    console.error('❌ Missing required asset hashes:', missingHashes.join(', '));
    process.exit(1);
  }

  console.log('✅ Extracted hashes:');
  Object.entries(hashes).forEach(([key, value]) => {
    console.log(`   ${key}: ${value}`);
  });

  return hashes;
}

// Build Auth0 configuration
function buildAuth0Config(hashes, baseUrl) {
  // Ensure URL has https:// and no trailing slash
  const cleanUrl = baseUrl.replace(/\/$/, '');
  
  return {
    rendering_mode: 'advanced',
    head_tags: [
      {
        tag: 'base',
        attributes: {
          href: `${cleanUrl}/`
        }
      },
      {
        tag: 'script',
        attributes: {
          src: `${cleanUrl}/assets/main.${hashes.main}.js`,
          type: 'module',
          defer: true
        }
      },
      {
        tag: 'link',
        attributes: {
          rel: 'stylesheet',
          href: `${cleanUrl}/assets/shared/style.${hashes.style}.css`
        }
      },
      {
        tag: 'script',
        attributes: {
          src: `${cleanUrl}/assets/login-id/index.${hashes.loginId}.js`,
          type: 'module',
          defer: true
        }
      },
      {
        tag: 'script',
        attributes: {
          src: `${cleanUrl}/assets/shared/react-vendor.${hashes.reactVendor}.js`,
          type: 'module',
          defer: true
        }
      },
      {
        tag: 'script',
        attributes: {
          src: `${cleanUrl}/assets/shared/vendor.${hashes.vendor}.js`,
          type: 'module',
          defer: true
        }
      }
    ]
  };
}

// Update Auth0 screen configuration
function updateAuth0Screen(prompt, screen, config) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(config);
    
    const options = {
      hostname: AUTH0_DOMAIN.replace('https://', ''),
      path: `/api/v2/prompts/${prompt}/screen/${screen}/rendering`,
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${AUTH0_TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 204) {
          console.log(`✅ Updated ${prompt}/${screen} - Status: ${res.statusCode}`);
          resolve({ success: true, statusCode: res.statusCode });
        } else {
          console.error(`❌ Failed to update ${prompt}/${screen} - Status: ${res.statusCode}`);
          console.error('Response:', responseData);
          reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error(`❌ Request error for ${prompt}/${screen}:`, error.message);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

// Main execution
async function main() {
  try {
    // Step 1: Fetch actual deployed HTML from Vercel
    console.log('🌐 Fetching deployed assets from Vercel...');
    const html = await getAssetHashesFromVercel(VERCEL_URL);
    
    // Extract hashes from script tags in HTML
    const mainMatch = html.match(/\/assets\/main\.([a-zA-Z0-9_-]+)\.js/);
    const styleMatch = html.match(/\/assets\/shared\/style\.([a-zA-Z0-9_-]+)\.css/);
    const vendorMatch = html.match(/\/assets\/shared\/vendor\.([a-zA-Z0-9_-]+)\.js/);
    const commonMatch = html.match(/\/assets\/shared\/common\.([a-zA-Z0-9_-]+)\.js/);
    
    // For login-id, we need to check the actual file on Vercel
    const loginIdFiles = await new Promise((resolve) => {
      https.get(`${VERCEL_URL}/screens/login-id/login-id/default.json`, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          // Try to find login-id hash by checking common patterns
          const loginIdMatch = html.match(/\/assets\/login-id\/index\.([a-zA-Z0-9_-]+)\.js/) || 
                              data.match(/index\.([a-zA-Z0-9_-]+)\.js/);
          resolve(loginIdMatch);
        });
      }).on('error', () => resolve(null));
    });
    
    const hashes = {
      style: styleMatch ? styleMatch[1] : null,
      main: mainMatch ? mainMatch[1] : null,
      loginId: loginIdFiles ? loginIdFiles[1] : null,
      vendor: vendorMatch ? vendorMatch[1] : null,
      reactVendor: null // Will extract if found
    };
    
    // Check for react-vendor
    const reactVendorMatch = html.match(/\/assets\/shared\/react-vendor\.([a-zA-Z0-9_-]+)\.js/);
    if (reactVendorMatch) {
      hashes.reactVendor = reactVendorMatch[1];
    }
    
    console.log('✅ Extracted hashes from Vercel deployment:');
    Object.entries(hashes).forEach(([key, value]) => {
      if (value) console.log(`   ${key}: ${value}`);
    });
    
    // Validate required hashes
    const requiredHashes = ['style', 'main', 'vendor'];
    const missingHashes = requiredHashes.filter(key => !hashes[key]);
    
    if (missingHashes.length > 0) {
      console.error('❌ Missing required hashes:', missingHashes.join(', '));
      console.error('HTML preview:', html.substring(0, 500));
      process.exit(1);
    }
    
    // Step 2: Build configuration
    const config = buildAuth0Config(hashes, VERCEL_URL);
    
    console.log('\n📝 Configuration to be applied:');
    console.log(JSON.stringify(config, null, 2));
    
    // Step 3: Update each screen
    console.log(`\n🔄 Updating ${SCREENS_TO_UPDATE.length} screen(s)...`);
    
    for (const screen of SCREENS_TO_UPDATE) {
      await updateAuth0Screen(screen, screen, config);
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n🎉 All screens updated successfully!');
    console.log('🔗 Your ACUL is now live at:', VERCEL_URL);
    
    // Save deployment info
    const deploymentInfo = {
      timestamp: new Date().toISOString(),
      vercelUrl: VERCEL_URL,
      hashes: hashes,
      screensUpdated: SCREENS_TO_UPDATE
    };
    
    fs.writeFileSync(
      path.join(__dirname, '../deployment-info.json'),
      JSON.stringify(deploymentInfo, null, 2)
    );
    
    console.log('💾 Deployment info saved to deployment-info.json');
    
  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

// Run the script
main();