# Outputs de l'infrastructure déployée

output "vpc_id" {
  description = "ID du VPC créé"
  value       = aws_vpc.main.id
}

output "vpc_cidr_block" {
  description = "CIDR block du VPC"
  value       = aws_vpc.main.cidr_block
}

output "public_subnet_ids" {
  description = "Liste des IDs des subnets publics"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "Liste des IDs des subnets privés"
  value       = aws_subnet.private[*].id
}

output "load_balancer_dns_name" {
  description = "Nom DNS du Load Balancer"
  value       = aws_lb.main.dns_name
}

output "load_balancer_zone_id" {
  description = "Zone ID du Load Balancer"
  value       = aws_lb.main.zone_id
}

output "load_balancer_arn" {
  description = "ARN du Load Balancer"
  value       = aws_lb.main.arn
}

output "target_group_arn" {
  description = "ARN du Target Group"
  value       = aws_lb_target_group.app.arn
}

output "autoscaling_group_name" {
  description = "Nom de l'Auto Scaling Group"
  value       = aws_autoscaling_group.app.name
}

output "autoscaling_group_arn" {
  description = "ARN de l'Auto Scaling Group"
  value       = aws_autoscaling_group.app.arn
}

output "launch_template_id" {
  description = "ID du Launch Template"
  value       = aws_launch_template.app.id
}

output "web_security_group_id" {
  description = "ID du Security Group pour les serveurs web"
  value       = aws_security_group.web.id
}

output "database_security_group_id" {
  description = "ID du Security Group pour la base de données"
  value       = aws_security_group.database.id
}

output "rds_endpoint" {
  description = "Endpoint de la base de données RDS"
  value       = var.create_rds ? aws_db_instance.main[0].endpoint : null
}

output "rds_port" {
  description = "Port de la base de données RDS"
  value       = var.create_rds ? aws_db_instance.main[0].port : null
}

output "application_url" {
  description = "URL de l'application"
  value       = "http://${aws_lb.main.dns_name}"
}

# Outputs pour Ansible
output "ansible_inventory_data" {
  description = "Données pour générer l'inventaire Ansible"
  value = {
    vpc_id                    = aws_vpc.main.id
    subnet_ids               = aws_subnet.public[*].id
    security_group_web_id    = aws_security_group.web.id
    security_group_db_id     = aws_security_group.database.id
    load_balancer_dns        = aws_lb.main.dns_name
    target_group_arn         = aws_lb_target_group.app.arn
    autoscaling_group_name   = aws_autoscaling_group.app.name
    launch_template_id       = aws_launch_template.app.id
    environment              = var.environment
    app_port                 = var.app_port
  }
}

# Output pour les scripts de déploiement
output "deployment_info" {
  description = "Informations nécessaires pour le déploiement"
  value = {
    region                   = var.aws_region
    environment              = var.environment
    load_balancer_dns        = aws_lb.main.dns_name
    autoscaling_group_name   = aws_autoscaling_group.app.name
    app_port                 = var.app_port
    vpc_id                   = aws_vpc.main.id
  }
  sensitive = false
} 