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

# Reference existing Resource Group
data "azurerm_resource_group" "rg" {
  name = var.resource_group_name
}

# Reference existing Virtual Network
data "azurerm_virtual_network" "vnet" {
  name                = var.vnet_name
  resource_group_name = data.azurerm_resource_group.rg.name
}

# Reference existing Subnet
data "azurerm_subnet" "subnet" {
  name                 = var.subnet_name
  virtual_network_name = data.azurerm_virtual_network.vnet.name
  resource_group_name  = data.azurerm_resource_group.rg.name
}

# Reference existing Public IP
data "azurerm_public_ip" "pip" {
  name                = "${var.vm_name}-pip"
  resource_group_name = data.azurerm_resource_group.rg.name
}

# Reference existing Network Interface (if it exists)
data "azurerm_network_interface" "nic" {
  name                = "${var.vm_name}-nic"
  resource_group_name = data.azurerm_resource_group.rg.name
}

# Reference existing VM (if it exists)
data "azurerm_windows_virtual_machine" "vm" {
  name                = var.vm_name
  resource_group_name = data.azurerm_resource_group.rg.name
}

output "vm_id" {
  value       = data.azurerm_windows_virtual_machine.vm.id
  description = "The ID of the Virtual Machine"
}

output "vm_name" {
  value       = data.azurerm_windows_virtual_machine.vm.name
  description = "The name of the Virtual Machine"
}

output "private_ip_address" {
  value       = data.azurerm_network_interface.nic.private_ip_address
  description = "The private IP address of the VM"
}

output "public_ip_address" {
  value       = data.azurerm_public_ip.pip.ip_address
  description = "The public IP address of the VM"
}
