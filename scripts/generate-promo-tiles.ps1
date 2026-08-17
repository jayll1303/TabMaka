Add-Type -AssemblyName System.Drawing

$baseDir = "D:\SideHustle\Extensions"
$iconPath = Join-Path $baseDir "public\android-chrome-512x512.png"
$assetsDir = Join-Path $baseDir "store\assets"

if (-not (Test-Path $iconPath)) {
    Write-Error "Icon file not found at $iconPath"
    exit 1
}

# -------------------------------------------------------------
# Function to save as 24-bit JPEG and 24-bit PNG (No Alpha)
# -------------------------------------------------------------
function Save-PromoImage($bmp, $baseName) {
    $jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
    $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
    $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]95)

    $jpgPath = Join-Path $assetsDir "$baseName.jpeg"
    $pngPath = Join-Path $assetsDir "$baseName.png"

    $bmp.Save($jpgPath, $jpegCodec, $encoderParams)
    $bmp.Save($pngPath, [System.Drawing.Imaging.ImageFormat]::Png)

    $encoderParams.Dispose()
    Write-Host "Generated: $jpgPath and $pngPath"
}

# Helper to find best font
function Get-PromoFont($familyName, $size, $style) {
    try {
        return New-Object System.Drawing.Font($familyName, $size, $style)
    } catch {
        return New-Object System.Drawing.Font("Segoe UI", $size, $style)
    }
}

# -------------------------------------------------------------
# 1. SMALL PROMO TILE (440 x 280)
# -------------------------------------------------------------
function Generate-SmallTile {
    $w = 440
    $h = 280
    $bmp = New-Object System.Drawing.Bitmap($w, $h)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

    # Background: Warm pastel cream
    $bgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(250, 246, 238))
    $g.FillRectangle($bgBrush, 0, 0, $w, $h)
    $bgBrush.Dispose()

    # Draw Mascot Icon
    $iconBytes = [System.IO.File]::ReadAllBytes($iconPath)
    $ms = New-Object System.IO.MemoryStream(,$iconBytes)
    $iconImg = [System.Drawing.Image]::FromStream($ms)

    $iconSize = 130
    $iconX = ($w - $iconSize) / 2
    $iconY = 24
    $g.DrawImage($iconImg, $iconX, $iconY, $iconSize, $iconSize)

    # Title: TabMaka
    $titleFont = Get-PromoFont "Segoe UI" 24 ([System.Drawing.FontStyle]::Bold)
    $titleBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(24, 28, 36))
    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment = [System.Drawing.StringAlignment]::Center

    $titleRect = New-Object System.Drawing.RectangleF(0, 162, $w, 36)
    $g.DrawString("TabMaka", $titleFont, $titleBrush, $titleRect, $sf)

    # Subtitle: Cozy New Tab Pet
    $subFont = Get-PromoFont "Segoe UI" 13 ([System.Drawing.FontStyle]::Regular)
    $subBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(100, 110, 125))
    $subRect = New-Object System.Drawing.RectangleF(0, 202, $w, 24)
    $g.DrawString("Cozy New Tab Pet", $subFont, $subBrush, $subRect, $sf)

    # Tag pill: 100% Local · No Tracking
    $badgeFont = Get-PromoFont "Segoe UI" 9 ([System.Drawing.FontStyle]::Bold)
    $badgeText = "100% Local  •  Distraction-Free"
    $badgeBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(120, 130, 145))
    $badgeRect = New-Object System.Drawing.RectangleF(0, 234, $w, 20)
    $g.DrawString($badgeText, $badgeFont, $badgeBrush, $badgeRect, $sf)

    $g.Dispose()
    $iconImg.Dispose()
    $ms.Dispose()

    Save-PromoImage $bmp "promo-small-440x280"
    $bmp.Dispose()
}

# -------------------------------------------------------------
# 2. MARQUEE PROMO TILE (1400 x 560)
# -------------------------------------------------------------
function Generate-MarqueeTile {
    $w = 1400
    $h = 560
    $bmp = New-Object System.Drawing.Bitmap($w, $h)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

    # Background: Warm pastel cream
    $bgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(250, 246, 238))
    $g.FillRectangle($bgBrush, 0, 0, $w, $h)
    $bgBrush.Dispose()

    # Subtle decorative backdrop shapes
    $circleBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(242, 235, 222))
    $g.FillEllipse($circleBrush, 900, -80, 500, 500)
    $circleBrush.Dispose()

    # Mascot Image (Right side hero)
    $iconBytes = [System.IO.File]::ReadAllBytes($iconPath)
    $ms = New-Object System.IO.MemoryStream(,$iconBytes)
    $iconImg = [System.Drawing.Image]::FromStream($ms)

    $iconSize = 340
    $iconX = 920
    $iconY = ($h - $iconSize) / 2
    $g.DrawImage($iconImg, $iconX, $iconY, $iconSize, $iconSize)

    # Left content
    $leftX = 120

    # Badge Pill: 🐸 NEW TAB COMPANION
    $pillBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(235, 245, 228))
    $g.FillRectangle($pillBrush, $leftX, 100, 250, 36)
    $pillBrush.Dispose()

    $pillTextFont = Get-PromoFont "Segoe UI" 11 ([System.Drawing.FontStyle]::Bold)
    $pillTextBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(70, 130, 40))
    $g.DrawString("NEW TAB COMPANION", $pillTextFont, $pillTextBrush, ($leftX + 22), 108)

    # Title: TabMaka
    $titleFont = Get-PromoFont "Segoe UI" 60 ([System.Drawing.FontStyle]::Bold)
    $titleBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(24, 28, 36))
    $g.DrawString("TabMaka", $titleFont, $titleBrush, $leftX, 150)

    # Subtitle: Cozy New Tab Pet
    $subFont = Get-PromoFont "Segoe UI" 28 ([System.Drawing.FontStyle]::Regular)
    $subBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(75, 85, 100))
    $g.DrawString("Your Cozy Frog Pet on Every New Tab", $subFont, $subBrush, $leftX, 260)

    # Bullet Highlights
    $bulletFont = Get-PromoFont "Segoe UI" 16 ([System.Drawing.FontStyle]::Regular)
    $bulletBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(100, 110, 125))
    
    $bullets = @(
        "• Real-time cursor following eye tracking & poke bounce",
        "• Ambient pastel themes & minimalist clock",
        "• 100% Local, zero tracking, zero accounts"
    )

    $by = 330
    foreach ($b in $bullets) {
        $g.DrawString($b, $bulletFont, $bulletBrush, $leftX, $by)
        $by += 38
    }

    $g.Dispose()
    $iconImg.Dispose()
    $ms.Dispose()

    Save-PromoImage $bmp "promo-marquee-1400x560"
    $bmp.Dispose()
}

Generate-SmallTile
Generate-MarqueeTile
Write-Host "All promo tiles generated successfully."
