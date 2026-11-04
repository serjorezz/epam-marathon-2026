data "aws_caller_identity" "current" {}

data "aws_region" "current" {}

locals {
  account_id = data.aws_caller_identity.current.account_id
  tags = {
    Project = "green-tasty"
    Track   = "aqa"
  }
}

# ---- source credentials (optional: only when a GitHub PAT is provided) ----
resource "aws_codebuild_source_credential" "github" {
  count       = var.github_token == "" ? 0 : 1
  auth_type   = "PERSONAL_ACCESS_TOKEN"
  server_type = "GITHUB"
  token       = var.github_token
}

# ---- artifacts + cache bucket ----
resource "aws_s3_bucket" "artifacts" {
  bucket        = "${var.project_prefix}-artifacts-${local.account_id}"
  force_destroy = true
  tags          = local.tags
}

resource "aws_s3_bucket_public_access_block" "artifacts" {
  bucket                  = aws_s3_bucket.artifacts.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "artifacts" {
  bucket = aws_s3_bucket.artifacts.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_versioning" "artifacts" {
  bucket = aws_s3_bucket.artifacts.id
  versioning_configuration { status = "Enabled" }
}

# ---- service role (least privilege: logs + its own bucket) ----
resource "aws_iam_role" "codebuild" {
  name = "${var.project_prefix}-codebuild"
  tags = local.tags

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "codebuild.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "codebuild" {
  role = aws_iam_role.codebuild.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "Logs"
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:${data.aws_region.current.name}:${local.account_id}:log-group:/aws/codebuild/${var.project_prefix}*"
      },
      {
        Sid    = "ArtifactsAndCache"
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:GetObjectVersion",
          "s3:PutObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.artifacts.arn,
          "${aws_s3_bucket.artifacts.arn}/*"
        ]
      }
    ]
  })
}

# ---- the project ----
resource "aws_codebuild_project" "aqa" {
  name          = "${var.project_prefix}-tests"
  description   = "Green & Tasty AQA suite: dotnet build + Reqnroll/TUnit/Playwright scenarios with TRX/HTML reports and traces as artifacts."
  service_role  = aws_iam_role.codebuild.arn
  build_timeout = 60
  tags          = local.tags

  artifacts {
    type     = "S3"
    location = aws_s3_bucket.artifacts.bucket
    path     = "/runs"
  }

  cache {
    type     = "S3"
    location = "${aws_s3_bucket.artifacts.bucket}/cache"
  }

  environment {
    compute_type                = var.compute_type
    image                       = "aws/codebuild/standard:8.0"
    type                        = "LINUX_CONTAINER"
    privileged_mode             = false
    image_pull_credentials_type = "CODEBUILD"

    environment_variable {
      name  = "AQA_UI_URL"
      value = var.aqa_ui_url
    }
    environment_variable {
      name  = "AQA_API_URL"
      value = var.aqa_api_url
    }
    environment_variable {
      name  = "AQA_TESTTABLE_ID"
      value = var.aqa_testtable_id
    }
    environment_variable {
      name  = "AQA_WAITER_USERNAME"
      value = var.aqa_waiter_username
    }
    environment_variable {
      name  = "AQA_WAITER_PASSWORD"
      value = var.aqa_waiter_password
      type  = "PLAINTEXT"
    }
    environment_variable {
      name  = "AQA_ADMIN_USERNAME"
      value = var.aqa_admin_username
    }
    environment_variable {
      name  = "AQA_ADMIN_PASSWORD"
      value = var.aqa_admin_password
    }
    environment_variable {
      name  = "AQA_TESTTABLE_WAITER_USERNAME"
      value = var.aqa_testtable_waiter_username
    }
    environment_variable {
      name  = "AQA_TESTTABLE_WAITER_PASSWORD"
      value = var.aqa_testtable_waiter_password
    }
    environment_variable {
      name  = "AQA_FILTER"
      value = var.aqa_default_filter
    }
    environment_variable {
      name  = "REPORTPORTAL_ENABLED"
      value = tostring(var.reportportal_enabled)
    }
    environment_variable {
      name  = "REPORTPORTAL_URL"
      value = var.reportportal_url
    }
    environment_variable {
      name  = "REPORTPORTAL_PROJECT"
      value = var.reportportal_project
    }
    environment_variable {
      name  = "REPORTPORTAL_SERVER_APIKEY"
      value = var.reportportal_api_key
    }
    environment_variable {
      name  = "REPORTPORTAL_LAUNCH_NAME"
      value = "Green & Tasty AQA (CodeBuild)"
    }
  }

  source {
    type            = "GITHUB"
    location        = var.github_repo_url
    git_clone_depth = 1
    buildspec       = var.buildspec_path
  }

  # No webhook: builds start on demand (`aws codebuild start-build`), on a schedule
  # (aws_scheduler_schedule), or manually in the console.
}
