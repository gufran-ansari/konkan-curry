/**
 * Konkan Curry - Google Sheet backup receiver.
 * ---------------------------------------------
 * Paste this whole file into the Apps Script editor of your Google Sheet
 * (Extensions -> Apps Script), then Deploy as a Web App (see steps below).
 *
 * DEPLOY STEPS:
 *   1. Create a new Google Sheet in the Gmail account you want the backup in.
 *   2. Top menu: Extensions -> Apps Script.
 *   3. Delete any sample code, paste ALL of this file, click Save (disk icon).
 *   4. Click "Deploy" -> "New deployment".
 *   5. Click the gear -> select "Web app".
 *   6. Description: Konkan Curry Forms
 *      Execute as: Me
 *      Who has access: Anyone
 *   7. Click Deploy -> Authorize access -> allow with your Google account.
 *   8. Copy the "Web app URL" (it ends with /exec).
 *   9. Send that URL to the developer to paste into backend/config.php.
 */

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Bookings') || ss.insertSheet('Bookings');

    var data = JSON.parse(e.postData.contents);

    var headers = [
      'timestamp', 'form_name', 'full_name', 'phone', 'email',
      'location', 'booking_date', 'booking_time', 'guests', 'message', 'extra'
    ];

    // Write the header row only once.
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    }

    var row = headers.map(function (h) { return data[h] !== undefined ? data[h] : ''; });
    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
