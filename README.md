# Azure Infrastructure Agent

A GitHub Copilot extension that provisions and manages Azure infrastructure using existing Terraform modules and enterprise CI/CD pipelines with zero hallucination.

## Overview

The Azure Infrastructure Agent is an intelligent automation tool that enables secure, auditable infrastructure provisioning through a natural language interface. It integrates with your Terraform module library and GitHub Actions workflows to create and update Azure resources reliably.

### Key Features

- **Zero Hallucination**: Only works with existing Terraform modules - never invents resources or configurations
- **Repository-Based**: All infrastructure definitions come directly from your Terraform repositories
- **Audit Trail**: Every change is tracked through pull requests and workflow runs
- **Environment-Aware**: Supports multiple environments (dev, staging, prod) with different configurations
- **Pipeline Integration**: Automatically triggers approved CI/CD pipelines for infrastructure deployment
- **Input Validation**: Validates all inputs against module requirements before proceeding

## Installation

1. Ensure you have GitHub Copilot installed in VS Code
2. Install this extension from the marketplace or load it locally
3. Configure GitHub credentials and repository access

## Usage

### Basic Command

```
/infra-agent <resource> <env> [inputs]
```

### Parameters

- **resource** (required): Type of Azure resource to provision
  - Examples: `app-service`, `cosmos-db`, `storage-account`, `sql-database`
  - Must match a module name in your Terraform repository

- **env** (required): Target environment
  - Examples: `dev`, `staging`, `prod`
  - Must be configured in your CI/CD workflows

- **inputs** (optional): Additional Terraform variables as JSON
  - Examples: `'{"name": "my-resource", "location": "eastus"}'`
  - Required inputs are validated against the module definition

### Example Usage

```
/infra-agent app-service dev '{"name": "my-api", "resource_group": "rg-dev", "location": "eastus"}'
```

The agent will:
1. Search your Terraform repository for the `app-service` module
2. Validate that all required variables are provided
3. Create a pull request with the infrastructure code
4. Trigger the `dev` environment deployment pipeline
5. Monitor and report the deployment status

## Workflow

```
┌─────────────────────────────────────┐
│  User Request                       │
│  (resource, env, inputs)            │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Search Terraform Repository        │
│  for matching module                │
└────────────┬────────────────────────┘
             │
        ┌────┴────┐
        │          │
   Found │     Not Found
        │          │
        ▼          ▼
  Validate    List Available
  Inputs      Modules & Exit
        │
        ├─ Missing?
        │  └─> Report Required Inputs
        │
        └─ Valid?
           └─> Create Pull Request
               & Trigger Pipeline
               ▼
          Monitor Deployment
               ▼
          Report Results
```

## Architecture

### Files

- **extension-manifest.json**: Extension metadata and configuration
- **commands/infra-agent.json**: Command definition and tool configuration
- **prompts/infra-agent.md**: System prompt with agent behavior and guidelines

### Tools Integrated

The agent uses the following GitHub APIs:
- `repos.get`: Retrieve repository information
- `search.code`: Search for Terraform modules in code
- `pulls.create`: Create pull requests with infrastructure changes
- `workflows.run`: Trigger CI/CD pipeline executions
- `runs.get`: Monitor workflow run status
- `runs.logs`: Retrieve deployment logs

## Requirements

### Prerequisites

- GitHub Copilot subscription
- GitHub repository with Terraform modules
- GitHub Actions workflows configured for each environment
- Appropriate GitHub permissions (repo access, workflow run permissions)

### Terraform Repository Structure

Your Terraform repository should follow this structure:

```
terraform/
├── modules/
│   └── azure/
│       ├── app-service/
│       │   ├── main.tf
│       │   ├── variables.tf
│       │   ├── outputs.tf
│       │   └── README.md
│       ├── cosmos-db/
│       └── storage-account/
├── environments/
│   ├── dev/
│   ├── staging/
│   └── prod/
└── .github/
    └── workflows/
        ├── deploy-dev.yml
        ├── deploy-staging.yml
        └── deploy-prod.yml
```

### CI/CD Workflow Requirements

Each environment workflow should:
- Accept Terraform module name and variables as inputs
- Run `terraform plan` and display the plan
- Apply changes after approval
- Report success/failure with resource details

Example workflow trigger:

```yaml
name: Deploy Infrastructure

on:
  workflow_dispatch:
    inputs:
      resource:
        description: 'Resource type to deploy'
        required: true
      variables:
        description: 'Terraform variables as JSON'
        required: true
```

## Best Practices

1. **Define Module Variables Clearly**: Ensure all module `variables.tf` files are complete and documented
2. **Use Module Versions**: Reference specific module versions in your deployment code
3. **Implement Approval Gates**: Require manual approval for production deployments
4. **Monitor Deployments**: Use workflow logs to track infrastructure changes
5. **Validate Inputs**: The agent validates inputs, but double-check PR descriptions before approving
6. **Document Modules**: Add clear comments explaining module purpose and usage

## Limitations

- **Module-Dependent**: Cannot provision resources outside your Terraform module library
- **No Custom Logic**: Cannot implement custom deployment logic - only uses what exists
- **Approved Workflows Only**: Can only trigger workflows configured in the repository
- **GitHub-Based**: Requires GitHub and GitHub Actions for CI/CD

## Troubleshooting

### "Module not found"
- Verify the module exists in your Terraform repository
- Check module naming matches your request
- List available modules with proper repository search

### "Missing required inputs"
- Review the module's `variables.tf` file
- Provide all required variables as JSON input
- Check for input validation errors in agent response

### "Pipeline failed"
- Review workflow run logs in GitHub Actions
- Check Terraform plan output for syntax errors
- Verify Azure credentials and permissions
- Review module outputs match expectations

### "Unauthorized workflow"
- Ensure the workflow exists and is properly configured
- Verify your GitHub token has workflow execution permissions
- Check the workflow is not restricted to certain branches/events

## Contributing

To improve this agent:
1. Update the prompt in `prompts/infra-agent.md` with new guidelines
2. Add new tools to `commands/infra-agent.json` as needed
3. Test with various Terraform modules and inputs
4. Document edge cases and limitations

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review your Terraform module definitions
3. Verify GitHub Actions workflow configurations
4. Check GitHub Copilot extension logs
