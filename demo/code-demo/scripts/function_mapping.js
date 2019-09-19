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
    return ((funcName === '_Report_save' || funcName === '_Report_saveAs') && ( 
        _session.embedId  === 'c52af8ab-0468-4165-92af-dc39858d66ad' /*Sample Report*/ ||
        _session.embedId  === '1ee0b264-b280-43f1-bbb7-9d8bd2d03a78' /*Sample dataset*/ ));
}

function IsBasicMock(funcName) {
    return ((funcName === '_Embed_BasicEmbed' || funcName === '_Embed_BasicEmbed_EditMode') && _session.embedId === 'c52af8ab-0468-4165-92af-dc39858d66ad');
}

function IsCreateMock(funcName) {
    return (funcName === '_Embed_Create' && _session.embedId === '1ee0b264-b280-43f1-bbb7-9d8bd2d03a78');
}

function IsNotSupported(funcName) {
    if (powerbi.embeds.length === 0) {
        return false
    }

    // Get a reference to the embedded element
    var embed = powerbi.get($('#reportContainer')[0]);
    if (embed.config.type !== 'create') {
        return false;
    }

    var runFunc = mockDict[funcName]; 
    return (runFunc && runFunc === datasetNotSupported) ? true : false;
}

function IsMock(funcName) {
    return (IsBasicMock(funcName) || IsSaveMock(funcName) || IsCreateMock(funcName) || IsNotSupported(funcName)); 
}

function mapFunc(func) {
    var funcName = getFuncName(func);
    return IsMock(funcName) ? mockDict[funcName] : func;
}

function getFuncName(func) {
    var funcName = func.name;
    
    if (!funcName)
    {
        // in IE, func.name is invalid method. so, function name should be extracted manually.
        funcName = func.toString().match(/^function\s*([^\s(]+)/)[1];
    }

    return funcName;
}