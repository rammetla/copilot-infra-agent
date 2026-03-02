# ☁️ CLOUD-ONLY (GitHub Actions) Terraform Deployment

## Overview
This repository is configured for **100% cloud-only, zero local execution** of Terraform infrastructure provisioning.
All infrastructure deployment happens in GitHub Actions runners without any local `terraform` commands.

## Workflows Configuration

### ✅ All Workflows are Cloud-Native
- **`deploy-dev.yml`** - Development environment (auto-apply)
- **`deploy-staging.yml`** - Staging environment (requires approval)
- **`deploy-prod.yml`** - Production environment (requires approval + manual review)

### 🔐 Azure Authentication
All workflows use Azure Service Principal authentication via GitHub Secrets:
- `AZURE_SUBSCRIPTION_ID` - Azure subscription ID
- `AZURE_CLIENT_ID` - Service principal client ID
- `AZURE_CLIENT_SECRET` - Service principal secret
- `AZURE_TENANT_ID` - Azure tenant ID

Terraform automatically detects these environment variables:
```
ARM_SUBSCRIPTION_ID
ARM_CLIENT_ID
ARM_CLIENT_SECRET
ARM_TENANT_ID
```

## Execution Flow

### Development Environment (Auto-Deploy)
```
GitHub Actions → Checkout → Setup Terraform → Initialize → Plan → Apply → Output Results
```
- **Trigger**: `workflow_dispatch` (manual trigger via GitHub UI)
- **Inputs**: `resource_type` and `variables_json` (JSON-formatted Terraform variables)
- **Auto-Apply**: Immediately applies without approval

### Staging Environment (Approval-Based)
```
GitHub Actions → Plan → Create PR for Review → Wait for Approval → Apply → Output Results
```
- **Trigger**: `workflow_dispatch` 
- **Review**: Auto-creates a GitHub Pull Request with the plan output
- **Approval**: Requires PR approval before applying

### Production Environment (Strict Approval)
```
GitHub Actions → Plan → Create PR (MANDATORY REVIEW) → Wait for Approval → Apply → Output Results
```
- **Trigger**: `workflow_dispatch`
- **Review**: Auto-creates a high-visibility PR with ⛔ ALERT
- **Approval**: Requires explicit infrastructure team approval via PR

## Terraform Paths (Cloud-Only)
All workflows execute Terraform from the correct paths:
- Development: `terraform-example/environments/dev`
- Staging: `terraform-example/environments/staging`
- Production: `terraform-example/environments/prod`

## State Management
- **Local State**: Currently uses local state (stored in GitHub Actions workspace)
- **Optional Remote State**: Backend is commented out in `terraform.tf`
- **To Enable Remote State**: Uncomment the `backend "azurerm"` block and configure Azure Storage Account

## Variables Handling
1. Static variables from `terraform.tfvars` in each environment
2. Dynamic variables from workflow input `variables_json` (passed as JSON)
3. Variables merged at runtime: `-var-file="terraform.tfvars" -var-file="/tmp/override.json"`

## How to Trigger a Deployment

### Option 1: GitHub UI (Recommended for Manual Deployments)
1. Go to **Actions** → **Deploy Infrastructure (Dev/Staging/Prod)**
2. Click **Run workflow**
3. Enter:
   - `resource_type`: e.g., `virtual-machine`
   - `variables_json`: e.g., `{"vm_name": "my-vm", "vm_size": "Standard_B2s"}`
4. Click **Run workflow**

### Option 2: GitHub API (Programmatic Dispatch)
```bash
curl -X POST \
  -H "Authorization: token YOUR_GITHUB_PAT" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/YOUR_OWNER/YOUR_REPO/actions/workflows/deploy-dev.yml/dispatches \
  -d '{
    "ref": "main",
    "inputs": {
      "resource_type": "virtual-machine",
      "variables_json": "{\"vm_name\": \"my-vm\", \"vm_size\": \"Standard_B2s\"}"
    }
  }'
```

### Option 3: Copilot Agent (Recommended for AI-Driven Workflows)
The Copilot agent (`infra-agent.md` prompt) can invoke the workflow API to trigger deployments programmatically.

## ✨ Key Features

✅ **Zero Local Execution** - No `terraform` commands run locally  
✅ **Cloud-Native** - All infrastructure provisioning in GitHub Actions  
✅ **Azure Authentication** - Service Principal via GitHub Secrets  
✅ **Environment Isolation** - Dev (auto), Staging/Prod (approval-based)  
✅ **Plan Review** - Auto-generates PR with plan output for review  
✅ **State Management** - Supports local or remote state (Azure Storage)  
✅ **Dynamic Variables** - JSON input for runtime variable override  
✅ **Automatic Outputs** - Terraform outputs captured and displayed  
✅ **Artifact Storage** - Plans uploaded as GitHub artifacts  

## 🚀 Next Steps

1. **Test Dev Deployment**
   - Trigger `deploy-dev.yml` workflow from GitHub Actions UI
   - Verify the Azure VM is created in the dev resource group

2. **Test Staging/Prod with Approvals**
   - Trigger `deploy-staging.yml` or `deploy-prod.yml`
   - Review the auto-generated PR
   - Approve to deploy

3. **Automate with Copilot Agent**
   - Use the Copilot agent to query infrastructure status
   - Agent can trigger workflow deployments via API

4. **(Optional) Enable Remote State**
   - Create an Azure Storage Account for Terraform state
   - Uncomment the `backend "azurerm"` block in `terraform.tf`
   - Workflow will automatically use remote state

## 📁 Repository Structure
```
.github/workflows/
  ├── deploy-dev.yml          # Development (auto-apply)
  ├── deploy-staging.yml      # Staging (approval-based)
  └── deploy-prod.yml         # Production (strict approval)

terraform-example/
  ├── terraform.tf            # Provider and backend config
  ├── environments/
  │   ├── dev/
  │   │   ├── main.tf
  │   │   ├── variables.tf
  │   │   └── terraform.tfvars
  │   ├── staging/
  │   └── prod/
  └── modules/
      └── azure/virtual-machine/
```

## 🔒 Security Best Practices

1. **GitHub Secrets** - All sensitive data (SPN credentials) stored as secrets
2. **PR Review** - Production deployments require explicit PR approval
3. **Audit Trail** - All workflow executions logged in GitHub Actions
4. **State Encryption** - Optional: Use Azure Storage with encryption at rest
5. **RBAC** - Configure GitHub environment protection rules for prod

## ❌ What's NOT Happening (Local Execution)

- ❌ No local `terraform init`
- ❌ No local `terraform plan`
- ❌ No local `terraform apply`
- ❌ No local state files in the repository
- ❌ No local machine setup required
- ❌ No developer credentials on local machine

All Terraform execution is **isolated to GitHub Actions** in the cloud!
