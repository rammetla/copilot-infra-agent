# VS Code Extension Setup

This is now a proper VS Code extension that integrates the Azure Infrastructure Agent as a Copilot Chat agent.

## Build & Test Locally

### Prerequisites
- Node.js 18+ 
- npm or yarn
- VS Code with GitHub Copilot extension installed

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Compile TypeScript:**
   ```bash
   npm run compile
   ```

3. **Watch mode (for development):**
   ```bash
   npm run watch
   ```

### Run the Extension

**Option 1: Using VS Code Launch Configuration**
1. Press `F5` or go to Run → Start Debugging
2. This opens a new VS Code window with the extension loaded
3. Open Copilot Chat (`Ctrl+Shift+I`) and try:
   ```
   @infra-agent deploy virtual-machine to dev
   ```

**Option 2: Manual Installation**
1. Build the extension:
   ```bash
   npm run compile
   ```
2. Package it as VSIX:
   ```bash
   npm install -g @vscode/vsce
   vsce package
   ```
3. Install the `.vsix` file in VS Code:
   - Extensions → Install from VSIX

## Agent Usage in Copilot Chat

Once installed, you can mention the agent:

```
@infra-agent what's configured in dev?
@infra-agent deploy app-service to staging
@infra-agent list available modules
```

## Environment Setup

Set the following environment variable for GitHub Actions integration:

```bash
export GITHUB_PAT=your_github_personal_access_token
```

## Project Structure

```
src/
  └── extension.ts         # Main extension entry point & agent handler
package.json              # Extension manifest & dependencies  
tsconfig.json            # TypeScript configuration
.vscode/
  ├── launch.json        # Debug configuration
  └── tasks.json         # Build tasks
terraform-example/       # Terraform modules & environments
trigger-workflow.js      # GitHub Actions trigger helper
```

## Publishing

To publish to the VS Code Marketplace:

```bash
vsce publish
```

You'll need a GitHub access token via Azure DevOps personal access token.

## Troubleshooting

- **Agent not showing up?** Ensure Copilot Chat is installed and the extension is activated
- **Compilation errors?** Run `npm install` again
- **Can't trigger workflows?** Check that `GITHUB_PAT` is set
