const https = require('https');

const token = process.env.GITHUB_PAT || '';
const owner = 'rammetla';
const repo = 'copilot-infra-agent';
const workflowId = 'deploy-dev.yml'; // Using the filename as ID

if (!token) {
  console.error('❌ Error: GITHUB_PAT environment variable not set');
  process.exit(1);
}

const payload = JSON.stringify({
  ref: 'main',
  inputs: {
    resource_type: 'virtual-machine',
    variables_json: JSON.stringify({
      vm_name: 'sample-vm',
      vm_size: 'Standard_B1ls',
      environment: 'dev',
      location: 'eastus'
    })
  }
});

// Try both possible API paths
const paths = [
  '/repos/' + owner + '/' + repo + '/actions/workflows/' + workflowId + '/dispatches',
  '/repos/' + owner + '/' + repo + '/actions/workflows/terraform-example/.github/workflows/' + workflowId + '/dispatches'
];

function triggerWorkflow(pathIndex) {
  if (pathIndex >= paths.length) {
    console.log('\n❌ All API paths failed. Trying alternative approach...\n');
    triggerViaWorkflowId();
    return;
  }

  const options = {
    hostname: 'api.github.com',
    path: paths[pathIndex],
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
      'User-Agent': 'Node.js'
    }
  };

  const req = https.request(options, (res) => {
    console.log('API Response Status: ' + res.statusCode);
    
    if (res.statusCode === 204 || res.statusCode === 200) {
      console.log('\n✅ Workflow Triggered Successfully!\n');
      console.log('📋 Deployment Details:');
      console.log('  ├─ Environment: DEV');
      console.log('  ├─ Resource Type: virtual-machine');
      console.log('  ├─ VM Name: sample-vm');
      console.log('  ├─ Resource Group: demo-vm');
      console.log('  ├─ Virtual Network: demo-vnet');
      console.log('  ├─ Subnet: sample-subnet');
      console.log('  ├─ VM Size: Standard_B1ls');
      console.log('  └─ Admin User: azureuser\n');
      
      console.log('🔗 Monitor Deployment:');
      console.log('  https://github.com/rammetla/copilot-infra-agent/actions\n');
    } else {
      triggerWorkflow(pathIndex + 1);
    }
  });

  req.on('error', (e) => {
    triggerWorkflow(pathIndex + 1);
  });

  req.write(payload);
  req.end();
}

function triggerViaWorkflowId() {
  // Get workflow ID first, then trigger
  const options = {
    hostname: 'api.github.com',
    path: '/repos/' + owner + '/' + repo + '/actions/workflows',
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'Node.js'
    }
  };

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const workflows = JSON.parse(data).workflows;
        const deployDev = workflows.find(w => w.name === 'Deploy Infrastructure (Dev)' || w.path.includes('deploy-dev'));
        
        if (deployDev) {
          triggerWithId(deployDev.id);
        } else {
          console.log('\n❌ Could not find deploy-dev workflow\n');
        }
      } catch (e) {
        console.log('\n❌ Error parsing workflows: ' + e.message + '\n');
      }
    });
  });

  req.on('error', (e) => {
    console.log('\n❌ Error: ' + e.message + '\n');
  });

  req.end();
}

function triggerWithId(workflowId) {
  const options = {
    hostname: 'api.github.com',
    path: '/repos/' + owner + '/' + repo + '/actions/workflows/' + workflowId + '/dispatches',
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
      'User-Agent': 'Node.js'
    }
  };

  const req = https.request(options, (res) => {
    if (res.statusCode === 204 || res.statusCode === 200) {
      console.log('\n✅ Workflow Triggered Successfully!\n');
      console.log('📋 Deployment Details:');
      console.log('  ├─ Environment: DEV');
      console.log('  ├─ Resource Type: virtual-machine');
      console.log('  ├─ VM Name: sample-vm');
      console.log('  ├─ Resource Group: demo-vm');
      console.log('  ├─ Virtual Network: demo-vnet');
      console.log('  ├─ Subnet: sample-subnet');
      console.log('  ├─ VM Size: Standard_B1ls');
      console.log('  └─ Admin User: azureuser\n');
      
      console.log('🔗 Monitor Deployment:');
      console.log('  https://github.com/rammetla/copilot-infra-agent/actions\n');
    } else {
      console.log('\n❌ Failed with status: ' + res.statusCode + '\n');
    }
  });

  req.on('error', (e) => {
    console.log('\n❌ Error: ' + e.message + '\n');
  });

  req.write(payload);
  req.end();
}

// Start the process
triggerWorkflow(0);
