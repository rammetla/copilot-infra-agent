output "vm_id" {
  description = "The ID of the created Virtual Machine"
  value       = azurerm_windows_virtual_machine.vm.id
}

output "vm_name" {
  description = "The name of the Virtual Machine"
  value       = azurerm_windows_virtual_machine.vm.name
}

output "private_ip_address" {
  description = "The private IP address of the VM"
  value       = azurerm_network_interface.nic.private_ip_address
}

output "public_ip_address" {
  description = "The public IP address of the VM"
  value       = azurerm_public_ip.pip.ip_address
}
