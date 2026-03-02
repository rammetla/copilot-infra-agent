terraform {
  required_version = ">= 1.0"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }

  # Uncomment for remote state storage
  # backend "azurerm" {
  #   resource_group_name  = "rg-terraform-state"
  #   storage_account_name = "tfstate"
  #   container_name       = "tfstate"
  #   key                  = "dev/terraform.tfstate"
  # }
}

provider "azurerm" {
  features {}
}

# Create Resource Group
resource "azurerm_resource_group" "rg" {
  name     = var.resource_group_name
  location = var.location

  tags = {
    Environment = var.environment
  }
}

# Create Virtual Network
resource "azurerm_virtual_network" "vnet" {
  name                = var.vnet_name
  location            = var.location
  resource_group_name = azurerm_resource_group.rg.name
  address_space       = ["10.0.0.0/16"]

  tags = {
    Environment = var.environment
  }
}

# Create Subnet
resource "azurerm_subnet" "subnet" {
  name                 = var.subnet_name
  resource_group_name  = azurerm_resource_group.rg.name
  virtual_network_name = azurerm_virtual_network.vnet.name
  address_prefixes     = ["10.0.1.0/24"]
}

# Call the virtual-machine module
module "virtual_machine" {
  source = "../../modules/azure/virtual-machine"

  vm_name             = var.vm_name
  location            = var.location
  resource_group_name = azurerm_resource_group.rg.name
  vm_size             = var.vm_size
  admin_password      = var.admin_password
  subnet_id           = azurerm_subnet.subnet.id
  environment         = var.environment
}

output "vm_id" {
  value       = module.virtual_machine.vm_id
  description = "The ID of the created Virtual Machine"
}

output "vm_name" {
  value       = module.virtual_machine.vm_name
  description = "The name of the Virtual Machine"
}

output "private_ip_address" {
  value       = module.virtual_machine.private_ip_address
  description = "The private IP address of the VM"
}

output "public_ip_address" {
  value       = module.virtual_machine.public_ip_address
  description = "The public IP address of the VM"
}
