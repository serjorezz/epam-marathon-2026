output "project_name" {
  description = "Name of the CodeBuild project running the AQA suite."
  value       = aws_codebuild_project.aqa.name
}

output "project_arn" {
  description = "ARN of the CodeBuild project."
  value       = aws_codebuild_project.aqa.arn
}

output "service_role_arn" {
  description = "ARN of the IAM role the build runs as (least privilege: logs + artifacts bucket)."
  value       = aws_iam_role.codebuild.arn
}

output "artifacts_bucket" {
  description = "S3 bucket that receives build artifacts (reports, TRX, traces) and the dependency cache."
  value       = aws_s3_bucket.artifacts.bucket
}

output "start_build_command" {
  description = "Command to trigger a build manually."
  value       = "aws codebuild start-build --project-name ${aws_codebuild_project.aqa.name}"
}
