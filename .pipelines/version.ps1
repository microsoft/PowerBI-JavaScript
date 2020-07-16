try {
  # package.json is in root folder, while version.ps1 runs in .pipelines folder.
  $version = (Get-Content "package.json") -join "`n" | ConvertFrom-Json | Select -ExpandProperty "version"
  $buildNumber = "$version"

  Write-Host "Build Number is" $buildNumber

  [Environment]::SetEnvironmentVariable("CustomBuildNumber", $buildNumber, "User")  # This will allow you to use it from env var in later steps of the same phase
  Write-Host "##vso[build.updatebuildnumber]${buildNumber}"                         # This will update build number on your build
}
catch {
  Write-Error $_.Exception
  exit 1;
}
