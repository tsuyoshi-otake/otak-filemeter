Add-Type -AssemblyName System.Drawing

function New-RoundedRectanglePath {
    param(
        [float]$X,
        [float]$Y,
        [float]$Width,
        [float]$Height,
        [float]$Radius
    )

    $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
    $diameter = $Radius * 2
    $path.AddArc($X, $Y, $diameter, $diameter, 180, 90)
    $path.AddArc($X + $Width - $diameter, $Y, $diameter, $diameter, 270, 90)
    $path.AddArc($X + $Width - $diameter, $Y + $Height - $diameter, $diameter, $diameter, 0, 90)
    $path.AddArc($X, $Y + $Height - $diameter, $diameter, $diameter, 90, 90)
    $path.CloseFigure()
    return $path
}

$size = 128
$bitmap = [System.Drawing.Bitmap]::new($size, $size)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.Clear([System.Drawing.Color]::Transparent)

$bounds = [System.Drawing.Rectangle]::new(0, 0, $size, $size)
$background = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
    $bounds,
    [System.Drawing.Color]::FromArgb(58, 58, 60),
    [System.Drawing.Color]::FromArgb(12, 12, 14),
    45
)
$graphics.FillEllipse($background, 0, 0, $size, $size)
$graphics.DrawEllipse([System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(32, 255, 255, 255), 1.4), 1, 1, 126, 126)

$shadow = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(72, 0, 0, 0))
$shadowPath = New-RoundedRectanglePath 34 29 66 78 10
$graphics.FillPath($shadow, $shadowPath)
$shadowPath.Dispose()

$paper = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(247, 247, 248))
$paperPath = New-RoundedRectanglePath 31 25 66 78 10
$graphics.FillPath($paper, $paperPath)
$paperPath.Dispose()

$fold = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(217, 219, 225))
$foldPath = [System.Drawing.Drawing2D.GraphicsPath]::new()
$foldPath.AddPolygon(@(
    [System.Drawing.PointF]::new(78, 25),
    [System.Drawing.PointF]::new(97, 44),
    [System.Drawing.PointF]::new(82, 44),
    [System.Drawing.PointF]::new(78, 40)
))
$graphics.FillPath($fold, $foldPath)
$foldPath.Dispose()

$ink = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(21, 23, 29))
$bar1 = New-RoundedRectanglePath 42 50 44 8 4
$bar2 = New-RoundedRectanglePath 42 66 33 8 4
$bar3 = New-RoundedRectanglePath 42 82 24 8 4
$graphics.FillPath($ink, $bar1)
$graphics.FillPath([System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(220, 21, 23, 29)), $bar2)
$graphics.FillPath([System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(184, 21, 23, 29)), $bar3)
$bar1.Dispose()
$bar2.Dispose()
$bar3.Dispose()

$outputPath = Join-Path (Get-Location) 'images/otak-filemeter-icon-128.png'
$bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)

$ink.Dispose()
$fold.Dispose()
$paper.Dispose()
$shadow.Dispose()
$background.Dispose()
$graphics.Dispose()
$bitmap.Dispose()
