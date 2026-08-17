Add-Type -AssemblyName System.Drawing

$baseDir = "D:\SideHustle\Extensions\store\assets"
$targetWidth = 1280
$targetHeight = 800

function Resize-Screenshot($fileName) {
    $filePath = Join-Path $baseDir $fileName
    if (-not (Test-Path $filePath)) {
        Write-Warning "File not found: $filePath"
        return
    }

    # Load image bytes to avoid locking file
    $bytes = [System.IO.File]::ReadAllBytes($filePath)
    $ms = New-Object System.IO.MemoryStream(,$bytes)
    $srcImg = [System.Drawing.Image]::FromStream($ms)

    Write-Host "Processing $fileName (Original: $($srcImg.Width)x$($srcImg.Height))..."

    # 1. Create standard 1280x800 bitmap
    $destBmp = New-Object System.Drawing.Bitmap($targetWidth, $targetHeight)
    $g = [System.Drawing.Graphics]::FromImage($destBmp)
    
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

    # Draw background fill
    $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(250, 246, 238))
    $g.FillRectangle($brush, 0, 0, $targetWidth, $targetHeight)
    $brush.Dispose()

    # Draw scaled image to fill 1280x800 exactly
    $g.DrawImage($srcImg, 0, 0, $targetWidth, $targetHeight)

    $g.Dispose()
    $srcImg.Dispose()
    $ms.Dispose()

    # Save as high-quality JPEG (Quality 95) - JPEG has NO alpha channel (24-bit RGB)
    $jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
    $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
    $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]95)

    $destBmp.Save($filePath, $jpegCodec, $encoderParams)
    Write-Host "Successfully saved: $filePath ($targetWidth x $targetHeight, 24-bit JPEG)"

    # Also save as 24-bit PNG
    $pngPath = [System.IO.Path]::ChangeExtension($filePath, ".png")
    $destBmp.Save($pngPath, [System.Drawing.Imaging.ImageFormat]::Png)
    Write-Host "Successfully saved: $pngPath ($targetWidth x $targetHeight, PNG)"

    $destBmp.Dispose()
    $encoderParams.Dispose()
}

Resize-Screenshot "screenshot-1.jpeg"
Resize-Screenshot "screenshot-2.jpeg"
