variable "vm_name" {
  description = "Name of the Virtual Machine"
  type        = string
}

variable "location" {
  description = "Azure region for resources"
  type        = string
  default     = "eastus"
}

variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
}

variable "vm_size" {
  description = "Size of the Virtual Machine"
  type        = string
  default     = "Standard_B1ls"
}

variable "admin_password" {
  description = "Administrator password for the VM"
  type        = string
  sensitive   = true
  default     = "P@ssw0rd1234!"
}

variable "subnet_id" {
  description = "Subnet ID for the network interface"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}
