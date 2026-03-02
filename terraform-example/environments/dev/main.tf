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
  virtual_network_name = var.vnet_name
  resource_group_name  = var.resource_group_name
}

# Reference existing Public IP
data "azurerm_public_ip" "pip" {
  name                = "${var.vm_name}-pip"
  resource_group_name = data.azurerm_resource_group.rg.name
}

# Reference existing Network Interface
data "azurerm_network_interface" "nic" {
  name                = var.nic_name
  resource_group_name = data.azurerm_resource_group.rg.name
}

# Create Windows Virtual Machine
resource "azurerm_windows_virtual_machine" "vm" {
  name                = var.vm_name
  location            = data.azurerm_resource_group.rg.location
  resource_group_name = data.azurerm_resource_group.rg.name
  size                = var.vm_size

  admin_username = "azureuser"
  admin_password = var.admin_password

  network_interface_ids = [
    data.azurerm_network_interface.nic.id,
  ]

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Premium_LRS"
  }

  source_image_reference {
    publisher = "MicrosoftWindowsServer"
    offer     = "WindowsServer"
    sku       = "2022-Datacenter"
    version   = "latest"
  }

  tags = {
    environment = var.environment
  }
}

output "vm_id" {
  value       = azurerm_windows_virtual_machine.vm.id
  description = "The ID of the created Virtual Machine"
}

output "vm_name" {
  value       = azurerm_windows_virtual_machine.vm.name
  description = "The name of the created Virtual Machine"
}

output "vm_private_ip" {
  value       = data.azurerm_network_interface.nic.private_ip_addresses[0]
  description = "The private IP address of the VM"
}

output "vm_public_ip" {
  value       = data.azurerm_public_ip.pip.ip_address
  description = "The public IP address of the VM"
}
