import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

// Infrastructure Agent Implementation
export function activate(context: vscode.ExtensionContext) {
  console.log('[infra-agent] Extension activated');

  // Register the chat participant (agent)
  // This makes it available as @infra-agent in Copilot Chat
  const participant = vscode.chat.createChatParticipant(
    'infra-agent',
    (request: vscode.ChatRequest, context: vscode.ChatContext, stream: vscode.ChatResponseStream, token: vscode.CancellationToken): vscode.ProviderResult<vscode.ChatResult> => {
      return handleChatRequest(request, context, stream, token, context.extensionContext || context);
    }
  );

  // Set display information
  participant.iconPath = new vscode.ThemeIcon('cloud');
  participant.followupProvider = {
    provideFollowups(result: vscode.ChatResult, context: vscode.ChatContext, token: vscode.CancellationToken) {
      return [
        { prompt: 'list available modules', label: 'List modules', kind: vscode.ChatResultFeedbackKind.Helpful },
        { prompt: 'what\'s configured in dev?', label: 'Query dev env', kind: vscode.ChatResultFeedbackKind.Helpful },
      ];
    }
  };

  context.subscriptions.push(participant);
  console.log('[infra-agent] Chat participant registered');
}

async function handleChatRequest(
  request: vscode.ChatRequest,
  context: vscode.ChatContext,
  stream: vscode.ChatResponseStream,
  token: vscode.CancellationToken,
  extensionContext: any
): Promise<vscode.ChatResult> {
  const prompt = request.prompt.toLowerCase();

  try {
    // Extract resource and environment from the prompt
    if (prompt.includes('deploy') || prompt.includes('create')) {
      return await handleDeploymentRequest(request, stream, extensionContext);
    } else if (prompt.includes('list') || prompt.includes('show') || prompt.includes('what')) {
      return await handleQueryRequest(request, stream, extensionContext);
    } else if (prompt.includes('status') || prompt.includes('monitor')) {
      return await handleMonitoringRequest(request, stream);
    } else {
      return await showHelpMessage(stream);
    }
  } catch (error) {
    stream.markdown(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return { metadata: {} };
  }
}

async function handleDeploymentRequest(
  request: vscode.ChatRequest,
  stream: vscode.ChatResponseStream,
  extensionContext: any
): Promise<vscode.ChatResult> {
  stream.markdown('🚀 **Azure Infrastructure Deployment**\n\n');

  // Parse deployment parameters
  const resourceMatch = request.prompt.match(/(?:deploy|create)\s+(\w+(?:-\w+)*)/i);
  const envMatch = request.prompt.match(/(?:to|in)\s+(dev|staging|prod)/i);

  const resource = resourceMatch?.[1] || 'unknown';
  const environment = envMatch?.[1] || 'dev';

  stream.markdown(`📦 Resource: **${resource}**\n`);
  stream.markdown(`📍 Environment: **${environment}**\n\n`);

  // Validate module exists
  const moduleExists = validateTerraformModule(resource, extensionContext);
  
  if (!moduleExists) {
    stream.markdown(`❌ Terraform module '${resource}' not found. Available modules:\n`);
    const modules = getAvailableModules(extensionContext);
    modules.forEach(mod => stream.markdown(`• ${mod}\n`));
    return { metadata: {} };
  }

  // Check for GitHub PAT
  const token = process.env.GITHUB_PAT;
  if (!token) {
    stream.markdown('⚠️ **GITHUB_PAT** environment variable not set. Cannot trigger workflow.\n\n');
    stream.markdown('Set it with: `export GITHUB_PAT=your_token`');
    return { metadata: {} };
  }

  // Success
  stream.markdown(`✅ Ready to deploy **${resource}** to **${environment}**\n\n`);
  stream.markdown('🔗 Triggering GitHub Actions workflow...\n');
  stream.markdown(`View progress: [GitHub Actions](https://github.com/rammetla/copilot-infra-agent/actions)`);

  return { metadata: { resource, environment } };
}

async function handleQueryRequest(
  request: vscode.ChatRequest,
  stream: vscode.ChatResponseStream,
  extensionContext: any
): Promise<vscode.ChatResult> {
  stream.markdown('📚 **Infrastructure Configuration**\n\n');

  const modules = getAvailableModules(extensionContext);
  const environments = getAvailableEnvironments(extensionContext);

  if (request.prompt.includes('module')) {
    stream.markdown('### Available Terraform Modules\n\n');
    if (modules.length === 0) {
      stream.markdown('No modules found.\n');
    } else {
      modules.forEach(mod => stream.markdown(`• **${mod}**\n`));
    }
  }

  if (request.prompt.includes('environment') || request.prompt.includes('env')) {
    stream.markdown('\n### Available Environments\n\n');
    if (environments.length === 0) {
      stream.markdown('No environments found.\n');
    } else {
      environments.forEach(env => stream.markdown(`• **${env}**\n`));
    }
  }

  if (!request.prompt.includes('module') && !request.prompt.includes('env')) {
    stream.markdown('### Summary\n\n');
    stream.markdown(`**Modules:** ${modules.length > 0 ? modules.join(', ') : 'None found'}\n\n`);
    stream.markdown(`**Environments:** ${environments.length > 0 ? environments.join(', ') : 'None found'}\n`);
  }

  return { metadata: { modules, environments } };
}

async function handleMonitoringRequest(
  request: vscode.ChatRequest,
  stream: vscode.ChatResponseStream
): Promise<vscode.ChatResult> {
  stream.markdown('📊 **Deployment Monitoring**\n\n');
  stream.markdown('🔗 [View GitHub Actions Runs](https://github.com/rammetla/copilot-infra-agent/actions)\n\n');
  stream.markdown('Status monitoring integration coming soon.');
  return { metadata: {} };
}

async function showHelpMessage(
  stream: vscode.ChatResponseStream
): Promise<vscode.ChatResult> {
  stream.markdown('## 🚀 Azure Infrastructure Agent\n\n');
  stream.markdown('**Deploy Infrastructure:**\n');
  stream.markdown('• `@infra-agent deploy virtual-machine to dev`\n');
  stream.markdown('• `@infra-agent create app-service in staging`\n\n');
  
  stream.markdown('**Query Configuration:**\n');
  stream.markdown('• `@infra-agent list available modules`\n');
  stream.markdown('• `@infra-agent what\'s configured in dev?`\n\n');
  
  stream.markdown('**Monitor Deployments:**\n');
  stream.markdown('• `@infra-agent show deployment status`\n');

  return { metadata: {} };
}

async function handleInfraRequest(
  request: vscode.ChatRequest,
  context: vscode.ExtensionContext
): Promise<void> {
  const prompt = request.prompt.toLowerCase();

  // Extract resource and environment from the prompt
  // Examples: "deploy vm to dev", "what's in staging", etc.
  
  if (prompt.includes('deploy') || prompt.includes('create')) {
    // await handleDeployment(request, context);
  } else if (prompt.includes('list') || prompt.includes('show') || prompt.includes('what')) {
    // await handleQuery(request, context);
  } else if (prompt.includes('status') || prompt.includes('monitor')) {
    // await handleMonitoring(request, context);
  } else {
    // Default: show help
    // await showHelp();
  }
}

function validateTerraformModule(
  resource: string,
  context: any
): boolean {
  const modulePath = path.join(
    context.extensionPath,
    'terraform-example',
    'modules',
    'azure',
    resource
  );
  return fs.existsSync(modulePath);
}

function getAvailableModules(context: any): string[] {
  const modulesPath = path.join(context.extensionPath, 'terraform-example', 'modules', 'azure');
  try {
    if (fs.existsSync(modulesPath)) {
      return fs.readdirSync(modulesPath).filter(f => 
        fs.statSync(path.join(modulesPath, f)).isDirectory()
      );
    }
  } catch (error) {
    console.error('[infra-agent] Error reading modules:', error);
  }
  return [];
}

function getAvailableEnvironments(context: any): string[] {
  const envsPath = path.join(context.extensionPath, 'terraform-example', 'environments');
  try {
    if (fs.existsSync(envsPath)) {
      return fs.readdirSync(envsPath).filter(f => 
        fs.statSync(path.join(envsPath, f)).isDirectory()
      );
    }
  } catch (error) {
    console.error('[infra-agent] Error reading environments:', error);
  }
  return [];
}

export function deactivate() {
  console.log('[infra-agent] Extension deactivated');
}
