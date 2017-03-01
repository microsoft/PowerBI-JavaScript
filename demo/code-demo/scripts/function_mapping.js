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

function IsSaveMock(func) {
    return ((func.name === '_Report_save' || func.name === '_Report_saveAs') && ( 
        _session.embedId  === 'bf33002e-9adc-452d-a0b5-fb649d806358' /*Sample Report*/ ||
        _session.embedId  === 'dc3974f1-49a5-468a-8484-3e14203d0cbb' /*Sample dataset*/ ));
}

function IsBasicMock(func) {
    return ((func.name === '_Embed_BasicEmbed' || func.name === '_Embed_BasicEmbed_EditMode') && _session.embedId === 'bf33002e-9adc-452d-a0b5-fb649d806358');
}

function IsCreateMock(func) {
    return (func.name === '_Embed_Create' && _session.embedId === 'dc3974f1-49a5-468a-8484-3e14203d0cbb');
}

function IsNotSupported(func) {
    if (powerbi.embeds.length === 0) {
        return false
    }

    // Get a reference to the embedded element
    var embed = powerbi.get($('#reportContainer')[0]);
    if (embed.config.type !== 'create') {
        return false;
    }

    return mockDict[func.name] ? true : false;
}

function IsMock(func) {
    return (IsBasicMock(func) || IsSaveMock(func) || IsCreateMock(func) || IsNotSupported(func)); 
}

function mapFunc(func) {
    return IsMock(func) ? mockDict[func.name] : func;
}