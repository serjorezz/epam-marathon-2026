variable "project_prefix" {
  description = "Name prefix for every resource this module creates."
  type        = string
  default     = "restaurant-aqa"
}

variable "github_repo_url" {
  description = "HTTPS clone URL of the GitHub repository the project builds from."
  type        = string
  default     = "https://github.com/serjorezz/epam-marathon-2026.git"
}

variable "github_token" {
  description = "GitHub personal access token used for source auth (aws_codebuild_source_credential). Leave empty to skip the credential; builds can still run via start-build source overrides (e.g. an S3 upload of the sources)."
  type        = string
  sensitive   = true
  default     = ""
}

variable "buildspec_path" {
  description = "Buildspec path relative to the repository root."
  type        = string
  default     = "aqa/buildspec.yml"
}

variable "compute_type" {
  description = "CodeBuild compute type. The suite runs Playwright + parallel .NET tests — 4 vCPU keeps UI scenarios stable."
  type        = string
  default     = "BUILD_GENERAL1_MEDIUM"
}

# ---- environment handed to the test suite (AQA_*) ----
variable "aqa_ui_url" { type = string }
variable "aqa_api_url" { type = string }
variable "aqa_testtable_id" {
  type    = string
  default = "table-r1"
}
variable "aqa_waiter_username" { type = string }
variable "aqa_waiter_password" {
  type      = string
  sensitive = true
}
variable "aqa_admin_username" {
  type    = string
  default = "admin@green-tasty.com"
}
variable "aqa_admin_password" {
  type      = string
  sensitive = true
  default   = ""
}
variable "aqa_testtable_waiter_username" { type = string }
variable "aqa_testtable_waiter_password" {
  type      = string
  sensitive = true
}
variable "aqa_default_filter" {
  description = "TUnit treenode filter used when AQA_FILTER is not overridden at start-build time. Defaults to the fast smoke slice; use an empty string for the whole suite."
  type        = string
  default     = "/*/*/*/*[Category=smoke]"
}

# ---- optional Report Portal reporting ----
variable "reportportal_enabled" {
  type    = bool
  default = false
}
variable "reportportal_url" {
  type    = string
  default = ""
}
variable "reportportal_project" {
  type    = string
  default = ""
}
variable "reportportal_api_key" {
  type      = string
  sensitive = true
  default   = ""
}
