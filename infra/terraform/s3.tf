# --- images bucket: public read for /assets/img/dishes and /assets/img/locations, IP-restricted ---

resource "aws_s3_bucket" "images" {
  bucket = "restaurant-backend-dev-images-${var.account_id}"
}

resource "aws_s3_bucket_server_side_encryption_configuration" "images" {
  bucket = aws_s3_bucket.images.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "images" {
  bucket                  = aws_s3_bucket.images.id
  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "images" {
  bucket = aws_s3_bucket.images.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "AllowPublicReadDishesAndLocations"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource = [
          "${aws_s3_bucket.images.arn}/assets/img/dishes/*",
          "${aws_s3_bucket.images.arn}/assets/img/locations/*",
        ]
      },
    ]
  })

  depends_on = [aws_s3_bucket_public_access_block.images]
}

# --- profile-images bucket: private ---

resource "aws_s3_bucket" "profile_images" {
  bucket = "restaurant-backend-dev-profile-images-${var.account_id}"
}

resource "aws_s3_bucket_server_side_encryption_configuration" "profile_images" {
  bucket = aws_s3_bucket.profile_images.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "profile_images" {
  bucket                  = aws_s3_bucket.profile_images.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# --- swagger-ui bucket: static website hosting, public read ---

resource "aws_s3_bucket" "swagger_ui" {
  bucket = "restaurant-backend-dev-swagger-ui-${var.account_id}"
}

resource "aws_s3_bucket_server_side_encryption_configuration" "swagger_ui" {
  bucket = aws_s3_bucket.swagger_ui.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "swagger_ui" {
  bucket                  = aws_s3_bucket.swagger_ui.id
  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = true
  restrict_public_buckets = false
}

resource "aws_s3_bucket_website_configuration" "swagger_ui" {
  bucket = aws_s3_bucket.swagger_ui.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "error.html"
  }
}

resource "aws_s3_bucket_policy" "swagger_ui" {
  bucket = aws_s3_bucket.swagger_ui.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "WebSiteHostingGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.swagger_ui.arn}/*"
      },
    ]
  })

  depends_on = [aws_s3_bucket_public_access_block.swagger_ui]
}

# --- frontend bucket: static website hosting, public read ---

resource "aws_s3_bucket" "frontend" {
  bucket = "restaurant-frontend-${var.account_id}"
}

resource "aws_s3_bucket_server_side_encryption_configuration" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket                  = aws_s3_bucket.frontend.id
  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = true
  restrict_public_buckets = false
}

resource "aws_s3_bucket_website_configuration" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }
}

resource "aws_s3_bucket_policy" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "WebSiteHostingGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.frontend.arn}/*"
      },
    ]
  })

  depends_on = [aws_s3_bucket_public_access_block.frontend]
}
