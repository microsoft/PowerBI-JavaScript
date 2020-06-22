Write-Host "Start running nuget_pack.ps1"

$versionNumber = [Environment]::GetEnvironmentVariable("CustomBuildNumber", "User");
$exitCode = 0;

Write-Host "Nuget Pack ..\PowerBI.JavaScript.nuspec -Version "$versionNumber
& nuget pack "..\PowerBI.JavaScript.nuspec" -Version $versionNumber

$exitCode += $LASTEXITCODE;

exit $exitCode