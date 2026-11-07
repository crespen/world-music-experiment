/**
 * EARTH TO EAR — Website -> private archive catalog synchronization
 *
 * Add this file to the EXISTING Listening Journal Apps Script project.
 * Uses WME_SHEET_ID already defined in Code.gs. No web deployment required.
 * This does not change Google Forms questions, journal answers, participant IDs,
 * or any installed form-submission triggers.
 */
const E2E_CATALOG_SOURCE = 'https://raw.githubusercontent.com/crespen/world-music-experiment/main/index.html';
const E2E_CATALOG_FUNCTION = 'syncEarthToEarArchiveCatalog';

function syncEarthToEarArchiveCatalog() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) throw new Error('Catalog sync already running.');
  try {
    const response = UrlFetchApp.fetch(E2E_CATALOG_SOURCE, {muteHttpExceptions: true});
    if (response.getResponseCode() !== 200) {
      throw new Error('Cannot read website catalog: HTTP ' + response.getResponseCode());
    }
    const html = response.getContentText();
    const matched = html.match(/(?:^|[\s;])const\s+R\s*=\s*(\[[\s\S]*?\]);/);
    if (!matched) throw new Error('Website catalog marker const R=[...] not found. Archive unchanged.');
    let catalog;
    try { catalog = JSON.parse(matched[1]); }
    catch (err) { throw new Error('Invalid website catalog JSON. Archive unchanged: ' + err.message); }
    if (!Array.isArray(catalog) || catalog.length < 12) {
      throw new Error('Website catalog is unexpectedly small or invalid. Archive unchanged.');
    }
    const seen = new Set();
    for (const item of catalog) {
      if (!item || !/^AFR-\d{4}$/.test(String(item.id || '')) ||
          !item.title || !item.artist || !item.listen || !item.journal ||
          !/^https:\/\//.test(item.listen) || !/^https:\/\/docs\.google\.com\/forms\//.test(item.journal) ||
          seen.has(item.id)) {
        throw new Error('Invalid or duplicate recording in website catalog. Archive unchanged: ' + JSON.stringify(item));
      }
      seen.add(item.id);
    }

    // Existing catalog tabs and research commentary are preserved.
    const ss = SpreadsheetApp.openById(WME_SHEET_ID);
    const recordings = ss.getSheetByName('Recordings');
    const staging = ss.getSheetByName('Listening Library Staging');
    if (!recordings || !staging) throw new Error('Required archive tabs missing. Archive unchanged.');
    const recordingIds = e2eKnownIds_(recordings);
    const stagingIds = e2eKnownIds_(staging);
    const newRecordings = catalog.filter(item => !recordingIds.has(item.id));
    const newStaging = catalog.filter(item => !stagingIds.has(item.id));

    // Populate only absent IDs. Never delete or rewrite existing curation,
    // historical notes, archived responses, or validation records.
    if (newRecordings.length) {
      const rows = newRecordings.map(x => [
        x.id, x.expedition || '', x.continent || 'Africa', x.country || '',
        x.tradition || '', x.title, x.artist, x.listen, 'To listen',
        x.description || '', x.era || x.period || '',
        'Recording date not yet verified', '', 'Historical lineage pending verification',
        '', '', x.access || 'Playback verification pending', x.listen, x.journal
      ]);
      recordings.getRange(recordings.getLastRow() + 1, 1, rows.length, 19).setValues(rows);
    }
    if (newStaging.length) {
      const rows = newStaging.map(x => [
        x.id, x.expedition || '', x.country || '', x.tradition || '',
        x.title, x.artist, x.era || x.period || '', x.listen,
        x.journal, x.description || ''
      ]);
      staging.getRange(staging.getLastRow() + 1, 1, rows.length, 10).setValues(rows);
    }
    Logger.log('Earth to Ear catalog checked: ' + catalog.length +
      ' website recordings, ' + newRecordings.length +
      ' added to Recordings, ' + newStaging.length + ' added to staging.');
  } finally {
    lock.releaseLock();
  }
}

function e2eKnownIds_(sheet) {
  const count = sheet.getLastRow() - 1;
  const ids = count > 0 ? sheet.getRange(2, 1, count, 1).getDisplayValues() : [];
  return new Set(ids.map(row => String(row[0]).trim()).filter(Boolean));
}

/**
 * Run ONCE after a successful manual sync. Creates just one hourly trigger,
 * without touching archiveListeningResponse or archiveWmeSuggestion.
 */
function installEarthToEarArchiveCatalogSync() {
  syncEarthToEarArchiveCatalog();
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === E2E_CATALOG_FUNCTION)
    .forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger(E2E_CATALOG_FUNCTION).timeBased().everyHours(1).create();
  Logger.log('Installed hourly Earth to Ear -> archive catalog synchronization.');
}

/** Optional: uninstall ONLY this catalog trigger, not other project triggers. */
function stopEarthToEarArchiveCatalogSync() {
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === E2E_CATALOG_FUNCTION)
    .forEach(t => ScriptApp.deleteTrigger(t));
  Logger.log('Removed Earth to Ear catalog synchronization trigger.');
}
