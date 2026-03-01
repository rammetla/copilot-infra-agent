# Azure Virtual Machine Module

Simple Terraform module to provision a Windows Virtual Machine in Azure.

## What This Module Creates

- **Virtual Machine**: Windows Server 2022 instance
- **Network Interface**: Connected to specified subnet
- **Public IP Address**: For remote access

## Required Inputs

| Variable | Type | Example |
|----------|------|---------|
| `vm_name` | string | `"my-vm"` |
| `resource_group_name` | string | `"rg-dev"` |
| `subnet_id` | string | `/subscriptions/.../subnets/default` |
| `admin_password` | string | `"P@ssw0rd123"` |

## Optional Inputs

| Variable | Default | Description |
|----------|---------|-------------|
| `location` | `"eastus"` | Azure region |
| `vm_size` | `"Standard_B2s"` | VM size |
| `environment` | `"dev"` | Environment label |

## Outputs

- `vm_id`: VM resource ID
- `vm_name`: VM name
- `private_ip_address`: Private IP
- `public_ip_address`: Public IP

## Usage Example

```hcl
module "vm" {
  source = "../../modules/azure/virtual-machine"

  vm_name             = "demo-vm"
  resource_group_name = "rg-dev"
  subnet_id           = "/subscriptions/.../subnets/default"
  admin_password      = "P@ssw0rd123"
  environment         = "dev"
}
```

## Prerequisites

- Existing Azure Resource Group
- Existing Virtual Network and Subnet
- Azure Provider configured

