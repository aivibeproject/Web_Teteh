/**
 * GOOGLE APPS SCRIPT FOR GOOGLE SHEETS
 * 
 * Cara Mengaktifkan Google Sheets Admin Otomatis:
 * 1. Buka Google Sheets baru di https://sheets.new
 * 2. Tulis judul kolom di Baris 1:
 *    [A1]: Timestamp
 *    [B1]: Answer
 *    [C1]: Selected Date
 *    [D1]: Selected Time
 *    [E1]: Ringkasan / Keterangan
 * 
 * 3. Buka menu Extensions (Ekstensi) -> Apps Script
 * 4. Ganti semua isi kode di editor dengan kode di bawah ini
 * 5. Klik tombol "Deploy" (Terapkan) di kanan atas -> "New deployment" (Penerapan baru)
 * 6. Klik ikon Gear (roda gigi) -> Pilih "Web app" (Aplikasi web)
 *    - Description: Webhook Undangan Video Call
 *    - Execute as: Me (email Anda)
 *    - Who has access: Anyone (Siapa saja)
 * 7. Klik "Deploy", beri izin akses akun Google Anda
 * 8. Salin Web App URL (berakhiran /exec)
 * 9. Masukkan ke file .env: GOOGLE_SHEET_WEBHOOK_URL="https://script.google.com/macros/s/.../exec"
 */

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getActiveSheet();
    
    // Parse data JSON dari webhook undangan
    var data = {};
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e.parameter) {
      data = e.parameter;
    }
    
    var timestamp = data.timestamp || Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd HH:mm:ss");
    var answer = data.answer || "YES";
    var selectedDate = data.selectedDate || "";
    var selectedTime = data.selectedTime || "";
    var note = (data.formattedDate ? data.formattedDate : "") + 
               (data.formattedTime ? " @ " + data.formattedTime : "");
    
    // Tambahkan baris baru sesuai format tabel yang diminta:
    // Timestamp | Answer | Selected Date | Selected Time | Keterangan
    sheet.appendRow([timestamp, answer, selectedDate, selectedTime, note]);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Data undangan tersimpan di Google Sheet!"
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "ok",
    message: "Google Apps Script webhook siap menerima respons undangan."
  })).setMimeType(ContentService.MimeType.JSON);
}
