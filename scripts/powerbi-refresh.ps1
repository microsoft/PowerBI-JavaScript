param(
    [string]$TenantId = $env:POWERBI_TENANT_ID,
    [string]$ClientId = $env:POWERBI_CLIENT_ID,
    [string]$ClientSecret = $env:POWERBI_CLIENT_SECRET,
    [string]$GroupId = $env:POWERBI_GROUP_ID,
    [string]$DatasetId = $env:POWERBI_DATASET_ID,
    [int]$TimeoutMinutes = 30,
    [int]$PollIntervalSeconds = 15,
    [string]$NotifyWebhook = $env:POWERBI_NOTIFY_WEBHOOK
)

function Write-Log { param($m) Write-Output "$(Get-Date -Format o) - $m" }

function Get-AuthToken {
    param($tenant,$client,$secret)
    if (-not ($tenant -and $client -and $secret)) { throw "TenantId, ClientId and ClientSecret are required (env or params)." }
    $body = @{ grant_type = 'client_credentials'; client_id = $client; client_secret = $secret; scope = 'https://analysis.windows.net/powerbi/api/.default' }
    $resp = Invoke-RestMethod -Method Post -Uri "https://login.microsoftonline.com/$tenant/oauth2/v2.0/token" -Body $body -ContentType 'application/x-www-form-urlencoded'
    return $resp.access_token
}

function Start-Refresh {
    param($token,$group,$dataset)
    $uri = "https://api.powerbi.com/v1.0/myorg/groups/$group/datasets/$dataset/refreshes"
    $body = @{ notifyOption = 'NoNotification' } | ConvertTo-Json
    try {
        Write-Log "POST refresh -> $uri"
        Invoke-RestMethod -Method Post -Uri $uri -Headers @{ Authorization = "Bearer $token" } -Body $body -ContentType 'application/json'
        Write-Log "Refresh requested successfully."
    } catch {
        throw "Failed to start refresh: $_"
    }
}

function Get-Latest-Refresh {
    param($token,$group,$dataset)
    $uri = "https://api.powerbi.com/v1.0/myorg/groups/$group/datasets/$dataset/refreshes`?$top=1"
    try {
        $resp = Invoke-RestMethod -Method Get -Uri $uri -Headers @{ Authorization = "Bearer $token" }
        return $resp.value | Select-Object -First 1
    } catch {
        throw "Failed to get refresh history: $_"
    }
}

function Notify-Webhook {
    param($webhookUrl,$payload)
    if (-not $webhookUrl) { return }
    try {
        Invoke-RestMethod -Method Post -Uri $webhookUrl -Body ($payload | ConvertTo-Json -Depth 5) -ContentType 'application/json' -ErrorAction Stop
        Write-Log "Notification sent to webhook."
    } catch {
        Write-Log "Failed to send notification: $_"
    }
}

# --- main ---
try {
    Write-Log "Starting Power BI dataset refresh automation"
    $token = Get-AuthToken -tenant $TenantId -client $ClientId -secret $ClientSecret
    Start-Refresh -token $token -group $GroupId -dataset $DatasetId

    $deadline = (Get-Date).AddMinutes($TimeoutMinutes)
    while ((Get-Date) -lt $deadline) {
        Start-Sleep -Seconds $PollIntervalSeconds
        $latest = Get-Latest-Refresh -token $token -group $GroupId -dataset $DatasetId
        if (-not $latest) { Write-Log "No refresh history yet; continuing to poll..."; continue }
        $status = $latest.status
        $startTime = $latest.startTime
        $endTime = $latest.endTime
        Write-Log "Latest refresh status: $status (started: $startTime, finished: $endTime)"
        if ($status -eq 'Completed') {
            Notify-Webhook -webhookUrl $NotifyWebhook -payload @{ status = 'Completed'; groupId = $GroupId; datasetId = $DatasetId; startTime = $startTime; endTime = $endTime }
            Write-Log "Refresh completed successfully.";
            exit 0
        } elseif ($status -eq 'Failed' -or $status -eq 'Unknown' -or $status -eq 'PartiallySucceeded') {
            Notify-Webhook -webhookUrl $NotifyWebhook -payload @{ status = $status; groupId = $GroupId; datasetId = $DatasetId; startTime = $startTime; endTime = $endTime; refresh = $latest }
            Write-Error "Refresh finished with status: $status"
            exit 2
        } else {
            # InProgress, Queued, etc.
            Write-Log "Refresh is $status; waiting..."
        }
    }
    Write-Error "Timeout waiting for refresh to finish after $TimeoutMinutes minutes."
    Notify-Webhook -webhookUrl $NotifyWebhook -payload @{ status = 'Timeout'; groupId = $GroupId; datasetId = $DatasetId }
    exit 3
} catch {
    Write-Error "Unhandled error: $_"
    Notify-Webhook -webhookUrl $NotifyWebhook -payload @{ status = 'Error'; message = $_.Exception.Message }
    exit 4
}