const mockDict = {
    _Report_GetPages: datasetNotSupported,
    _Report_SetPage: datasetNotSupported,
    _Report_SetFilters: datasetNotSupported,
    _Report_GetFilters: datasetNotSupported,
    _Report_RemoveFilters: datasetNotSupported,
    _Report_PrintCurrentReport: datasetNotSupported,
    _Report_UpdateSettings: datasetNotSupported,
    _Report_Reload: datasetNotSupported,
    _Page_SetActive: datasetNotSupported,
    _Page_SetFilters: datasetNotSupported,
    _Page_GetFilters: datasetNotSupported,
    _Page_RemoveFilters: datasetNotSupported,
    _Page_GetVisuals: datasetNotSupported,
    _Report_switchModeEdit: datasetNotSupported,
    _Report_switchModeView: datasetNotSupported,
    _Embed_BasicEmbed: _Mock_Embed_BasicEmbed_ViewMode,
    _Embed_BasicEmbed_EditMode: _Mock_Embed_BasicEmbed_EditMode,
    _Report_save: _Mock_Report_save,
    _Report_saveAs: _Mock_Report_save,
    _Embed_Create: _Mock_Embed_Create
};

function datasetNotSupported() {
    Log.logText('Operation not supported for dataset')
}

function IsSaveMock(funcName) {
    const sampleId = GetSession(SessionKeys.SampleId);
    const isSample = sampleId && (_session.embedId  === sampleId);
    return ((funcName === '_Report_save' || funcName === '_Report_saveAs') && isSample);
}

function IsBasicMock(funcName) {
    const sampleId = GetSession(SessionKeys.SampleId);
    const isSample = sampleId && (_session.embedId  === sampleId);
    return ((funcName === '_Embed_BasicEmbed' || funcName === '_Embed_BasicEmbed_EditMode') && isSample);
}

function IsCreateMock(funcName) {
    const sampleId = GetSession(SessionKeys.SampleId);
    const isSample = sampleId && (_session.embedId  === sampleId);
    return (funcName === '_Embed_Create' && isSample);
}

function IsNotSupported(funcName) {
    if (powerbi.embeds.length === 0) {
        return false
    }

    const notReportMatch = funcName.match(/Dashboard|Tile|Qna|Visual|Mobile|PaginatedReport/);
    if (notReportMatch) {
      return false;
    }

     // Get a reference to the embedded element
    const container = '#embedContainer';
    let embed = powerbi.get($(container)[0]);
    if (embed.config.type !== 'create') {
        return false;
    }

    const runFunc = mockDict[funcName];
    return (runFunc && runFunc === datasetNotSupported) ? true : false;
}

function IsMock(funcName) {
    return (IsBasicMock(funcName) || IsSaveMock(funcName) || IsCreateMock(funcName) || IsNotSupported(funcName));
}

function mapFunc(func) {
    const funcName = getFuncName(func);
    return IsMock(funcName) ? mockDict[funcName] : func;
}

function getFuncName(func) {
    let funcName = func.name;

    if (!funcName)
    {
        // in IE, func.name is invalid method. so, function name should be extracted manually.
        funcName = func.toString().match(/^function\s*([^\s(]+)/)[1];
    }

    return funcName;
}