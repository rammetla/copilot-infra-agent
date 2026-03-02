# How to Use the Azure Infrastructure Agent

## 🚀 Quick Start

### For GitHub Copilot Users

1. **In GitHub Copilot Chat**, mention the agent:
   ```
   @infra-agent deploy virtual-machine to dev with name "my-vm" and size "Standard_B2s"
   ```

2. **The agent will:**
   - ✅ Read the Terraform configuration
   - ✅ Validate your input
   - ✅ Trigger the appropriate GitHub Actions workflow
   - ✅ Monitor execution and report results

### Available Commands

#### Query Infrastructure
```
@infra-agent what infrastructure is configured in dev?
@infra-agent list all available Terraform modules
@infra-agent what variables are required for VM deployment?
```

#### Trigger Deployments
```
@infra-agent deploy virtual-machine to dev with vm_name="test-vm" and vm_size="Standard_B2s"
@infra-agent deploy to staging with variables {"vm_name":"prod-vm","vm_size":"Standard_B4ms"}
@infra-agent run prod workflow - Approved for PROD
```

#### Monitor Deployments
```
@infra-agent show latest deployment status
@infra-agent get workflow results for dev environment
```

## 📋 Prerequisites

The agent requires:
1. ✅ GitHub Copilot subscription
2. ✅ Access to the repository with Terraform code
3. ✅ GitHub token with appropriate permissions
4. ✅ Azure credentials in GitHub Secrets (AZURE_SUBSCRIPTION_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, AZURE_TENANT_ID)

## 🔒 Security & Guardrails

The agent operates in **READ-ONLY mode** with these safeguards:
- ❌ Cannot modify any Terraform code
- ❌ Cannot create pull requests with code changes
- ❌ Cannot commit to the repository
- ✅ Can only trigger pre-configured workflows
- ✅ Requires explicit approval for PROD deployments

## 📚 Agent Capabilities

### Read & Query
- Read Terraform module definitions
- List available resources and variables
- Show current infrastructure configuration
- Display workflow definitions

### Trigger Workflows
- Dispatch GitHub Actions workflows
- Pass variables to deployment pipelines
- Monitor workflow execution
- Report results and logs

### Environments Supported
- **dev** - Auto-deployment (no approval needed)
- **staging** - Requires approval via PR
- **prod** - Requires explicit "Approved for PROD" confirmation

## 🎯 Example Workflows

### Deploy a VM to Dev
```
User: @infra-agent deploy a Windows VM to dev
Agent: I need some information:
  - vm_name (required)
  - vm_size (optional, defaults to Standard_B1ls)
  - admin_password (optional, defaults to generated)

User: @infra-agent use vm_name="test-vm" and vm_size="Standard_B2s"
Agent: ✅ Triggering deploy-dev.yml workflow...
  Running: Terraform plan → Terraform apply
  Status: https://github.com/rammetla/copilot-infra-agent/actions/runs/12345678
```

### Deploy to Staging
```
User: @infra-agent deploy to staging
Agent: Staging requires approval. Please provide resource details and confirm approval.

User: @infra-agent deploy with vm_name="staging-vm" - Approved for staging
Agent: ✅ Triggering deploy-staging.yml...
  Workflow will: Create PR → Require review → Deploy on approval
  PR: https://github.com/...
```

### Deploy to Production
```
User: @infra-agent deploy to prod
Agent: ⛔ Production deployment requires explicit approval.
  Please confirm: "Approved for PROD"

User: Approved for PROD
Agent: ✅ Triggering deploy-prod.yml...
  This is a PRODUCTION deployment. Monitor carefully.
  Run: https://github.com/...
```

## 🔧 Configuration

The agent configuration files:
- `extension-manifest.json` - Agent registration
- `commands/infra-agent.json` - Command definition
- `prompts/infra-agent.md` - Agent system prompt (read-only guardrails)
- `app-manifest.json` - GitHub App configuration

## 📞 Support

For issues or questions:
1. Check the agent prompt at `prompts/infra-agent.md`
2. Review workflow files at `.github/workflows/`
3. Check GitHub Actions logs for deployment details
4. Open an issue in the repository

## 🚫 Limitations

- Agent is **read-only** - cannot modify code
- Can only trigger workflows in this repository
- Requires valid Azure credentials in GitHub Secrets
- PROD deployments require explicit approval
- Only supports environments with configured workflows

---

**Status**: ✅ Agent is configured and ready to use
**Last Updated**: March 2, 2026
