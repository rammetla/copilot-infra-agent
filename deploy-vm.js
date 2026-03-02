#!/usr/bin/env node

const https = require('https');

// Configuration
const GITHUB_OWNER = 'rammetla';
const GITHUB_REPO = 'copilot-infra-agent';
const WORKFLOW_FILE = 'deploy-dev.yml';
const GITHUB_PAT = process.env.GITHUB_PAT || '';

// Terraform variables for VM creation
const variables = {
  vm_name: 'sample-vm',
  vm_size: 'Standard_B1ls',
  environment: 'dev',
  location: 'eastus'
};

if (!GITHUB_PAT) {
  console.error('❌ Error: GITHUB_PAT environment variable not set');
  process.exit(1);
}

console.log('🚀 Triggering Azure VM deployment workflow...');
console.log(`📦 Workflow: ${WORKFLOW_FILE}`);
console.log(`📍 Repository: ${GITHUB_OWNER}/${GITHUB_REPO}`);
console.log(`🔧 VM Configuration:`, variables);

const postData = JSON.stringify({
  ref: 'main',
  inputs: {
    resource_type: 'virtual-machine',
    variables_json: JSON.stringify(variables)
  }
});

const options = {
  hostname: 'api.github.com',
  path: `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/actions/workflows/${WORKFLOW_FILE}/dispatches`,
  method: 'POST',
  headers: {
    'Accept': 'application/vnd.github.v3+json',
    'Authorization': `token ${GITHUB_PAT}`,
    'User-Agent': 'GitHub-Actions-Trigger',
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = https.request(options, (res) => {
  console.log(`\n📡 Response Status: ${res.statusCode}`);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 204) {
      console.log('✅ Workflow triggered successfully!');
      console.log('\n⏳ The GitHub Actions workflow is now running...');
      console.log(`🔗 View progress: https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/actions/workflows/${WORKFLOW_FILE}`);
      console.log('\n📊 Expected Timeline:');
      console.log('  1. Checkout code (1-2 seconds)');
      console.log('  2. Setup Terraform (5-10 seconds)');
      console.log('  3. Terraform Init (10-15 seconds)');
      console.log('  4. Terraform Plan (15-30 seconds)');
      console.log('  5. Terraform Apply (60-120 seconds) - Creates Azure VM');
      console.log('  6. Output Results (5-10 seconds)');
      console.log('\n✨ Total time: ~2-3 minutes');
      console.log('\n🎯 Expected Output:');
      console.log('  - Azure Resource Group: sample-rg');
      console.log('  - Virtual Network: sample-vnet');
      console.log('  - Subnet: sample-subnet');
      console.log('  - Network Interface: sample-nic');
      console.log('  - Virtual Machine: sample-vm (Standard_B1ls)');
      process.exit(0);
    } else if (res.statusCode === 422) {
      console.log('⚠️  Workflow already queued or in progress');
      console.log(`Check: https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/actions`);
      process.exit(0);
    } else {
      console.error('❌ Failed to trigger workflow');
      console.error('Response:', data);
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request error:', error.message);
  process.exit(1);
});

req.write(postData);
req.end();
