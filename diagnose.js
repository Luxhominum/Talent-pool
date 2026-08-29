function diagnoseAccess() {
  var result = {
    effectiveUser: Session.getEffectiveUser().getEmail(),
    sheetId: CONFIG.SPREADSHEET_ID,
    openError: null,
    sheetTitle: null,
    sheets: []
  };
  try {
    var ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    result.sheetTitle = ss.getName();
    result.sheets = ss.getSheets().map(function(s) {
      return { name: s.getName(), id: s.getSheetId(), rows: s.getLastRow() };
    });
  } catch (e) {
    result.openError = e.toString();
  }
  return JSON.stringify(result);
}
