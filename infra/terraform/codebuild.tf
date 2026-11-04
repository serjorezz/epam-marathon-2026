# AWS CodeBuild pipeline for the AQA suite (star task: cloud CI for the tests).
# Credentials for the standing accounts are supplied via gitignored terraform.tfvars or
# TF_VAR_* environment variables — never commit them. A GitHub PAT is optional; without it,
# run builds with source overrides (see infra/terraform/codebuild/README.md).
module "codebuild" {
  source = "./codebuild"

  github_token = var.codebuild_github_token

  aqa_ui_url                    = var.codebuild_aqa_ui_url
  aqa_api_url                   = var.codebuild_aqa_api_url
  aqa_testtable_id              = var.codebuild_aqa_testtable_id
  aqa_waiter_username           = var.codebuild_waiter_username
  aqa_waiter_password           = var.codebuild_waiter_password
  aqa_admin_username            = var.codebuild_admin_username
  aqa_admin_password            = var.codebuild_admin_password
  aqa_testtable_waiter_username = var.codebuild_testtable_waiter_username
  aqa_testtable_waiter_password = var.codebuild_testtable_waiter_password
  reportportal_enabled          = var.codebuild_reportportal_enabled
  reportportal_url              = var.codebuild_reportportal_url
  reportportal_project          = var.codebuild_reportportal_project
  reportportal_api_key          = var.codebuild_reportportal_api_key
}
