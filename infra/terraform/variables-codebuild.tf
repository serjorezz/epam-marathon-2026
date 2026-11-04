# ---- AQA CodeBuild pipeline (star task) ----
# Values come from TF_VAR_* env vars or a gitignored terraform.tfvars — never commit credentials.

variable "codebuild_github_token" {
  description = "GitHub PAT for CodeBuild source auth. Optional: without it builds run via source overrides."
  type        = string
  sensitive   = true
  default     = ""
}

variable "codebuild_aqa_ui_url" {
  type    = string
  default = "http://restaurant-frontend-060913167510.s3-website.us-east-1.amazonaws.com"
}

variable "codebuild_aqa_api_url" {
  type    = string
  default = "https://pin0yvpmgk.execute-api.us-east-1.amazonaws.com/develop"
}

variable "codebuild_aqa_testtable_id" {
  type    = string
  default = "table-r1"
}

variable "codebuild_waiter_username" {
  type    = string
  default = "waiter@green-tasty.com"
}

variable "codebuild_waiter_password" {
  type      = string
  sensitive = true
  default   = ""
}

variable "codebuild_admin_username" {
  type    = string
  default = "admin@green-tasty.com"
}

variable "codebuild_admin_password" {
  type      = string
  sensitive = true
  default   = ""
}

variable "codebuild_testtable_waiter_username" {
  type    = string
  default = "waiter.rustaveli@green-tasty.com"
}

variable "codebuild_testtable_waiter_password" {
  type      = string
  sensitive = true
  default   = ""
}

variable "codebuild_reportportal_enabled" {
  type    = bool
  default = false
}

variable "codebuild_reportportal_url" {
  type    = string
  default = ""
}

variable "codebuild_reportportal_project" {
  type    = string
  default = ""
}

variable "codebuild_reportportal_api_key" {
  type      = string
  sensitive = true
  default   = ""
}
