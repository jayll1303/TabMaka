Add-Type -AssemblyName System.Drawing

$baseDir = "D:\SideHustle\Extensions"
$srcPath = Join-Path $baseDir "favicon_extracted\android-chrome-512x512.png"
$srcImg = [System.Drawing.Image]::FromFile($srcPath)

function Resize-Image($width, $height, $destPath) {
    $bmp = New-Object System.Drawing.Bitmap $width, $height
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.DrawImage($srcImg, 0, 0, $width, $height)
    $bmp.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
}

# Ensure directories exist
New-Item -ItemType Directory -Force -Path (Join-Path $baseDir "public\icons")

# Copy base favicons to public root
Copy-Item (Join-Path $baseDir "favicon_extracted\*") (Join-Path $baseDir "public\") -Force

# Copy & Generate icons in public/icons
Copy-Item (Join-Path $baseDir "favicon_extracted\favicon-16x16.png") (Join-Path $baseDir "public\icons\icon-16.png") -Force
Copy-Item (Join-Path $baseDir "favicon_extracted\favicon-32x32.png") (Join-Path $baseDir "public\icons\icon-32.png") -Force
Resize-Image 48 48 (Join-Path $baseDir "public\icons\icon-48.png")
Resize-Image 128 128 (Join-Path $baseDir "public\icons\icon-128.png")

$srcImg.Dispose()
Write-Host "Favicons and icons successfully generated and copied."
