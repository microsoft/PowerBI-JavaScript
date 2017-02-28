function datasetNotSupported() {
  Log.logText('Operation not supported for dataset')
}

function IsSaveMock(func) {
  return ((func.name === '_Report_save' || func.name === '_Report_saveAs') &&  
  (_session.embedId  === 'bf33002e-9adc-452d-a0b5-fb649d806358' /*Sample Report*/ ||
  _session.embedId  === 'dc3974f1-49a5-468a-8484-3e14203d0cbb' /*Sample dataset*/ ));
}

function IsBasicMock(func) {
  return (func.name === '_Embed_BasicEmbed' && _session.embedId === 'bf33002e-9adc-452d-a0b5-fb649d806358');
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

  return (func.name === '_Report_GetPages' ||
  func.name === '_Report_SetPage' ||
  func.name === '_Report_SetFilters' ||
  func.name === '_Report_GetFilters' ||
  func.name === '_Report_RemoveFilters' ||
  func.name === '_Report_PrintCurrentReport' ||
  func.name === '_Report_UpdateSettings' ||
  func.name === '_Report_Reload' ||
  func.name === '_Page_SetActive' ||
  func.name === '_Page_SetFilters' ||
  func.name === '_Page_GetFilters' ||
  func.name === '_Page_RemoveFilters' ||
  func.name === '_Report_switchModeEdit' ||
  func.name === '_Report_switchModeView'); 
}

function mapFunc(func) {
  if(IsBasicMock(func)) {
      return _Mock_Embed_BasicEmbed;
    } else if (IsSaveMock(func)) {
      return _Mock_Report_save;
    } else if (IsCreateMock(func)) {
      return _Mock_Embed_Create;
    } else if (IsNotSupported(func)) {
      return datasetNotSupported;
    }
  
  return func;
}