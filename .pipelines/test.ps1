$exitCode = 0;

Write-Host "start: npm run test"
& npm run test
Write-Host "done: npm run test"

$exitCode += $LASTEXITCODE;

exit $exitCode;