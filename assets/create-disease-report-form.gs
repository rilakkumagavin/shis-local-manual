// Blank template only. Review school privacy policy before publishing.
function createDiseaseReportForm() {
  const SCHOOL_NAME = '青溪國小';
  const INCLUDE_SENSITIVE_FIELDS = false;
  const form = FormApp.create(SCHOOL_NAME + '傳染病通報表', false);
  form.setDescription('請填寫學生本人的姓名、班級及座號，勿將家長姓名填入學生姓名。正式發布前，請承辦人補上資料蒐集目的、必要欄位、使用範圍、保存期限與聯絡窗口。');
  form.setPublishingSummary(false);
  const text = (title, required, help) => {
    const item = form.addTextItem().setTitle(title).setRequired(required);
    if (help) item.setHelpText(help);
    return item;
  };
  const choice = (title, values, required) => form.addMultipleChoiceItem()
    .setTitle(title).setChoiceValues(values).setRequired(required);
  const date = (title, required) => form.addDateItem()
    .setTitle(title).setIncludesYear(true).setRequired(required);

  text('姓名', true, '請填學生本人姓名，不是家長姓名。');
  text('班級(例如:一年一班請填1-1)', true);
  text('座號', true, '請填數字，例如 13。');
  if (INCLUDE_SENSITIVE_FIELDS) {
    text('身分證字號', true);
    date('生日', true);
    text('聯絡地址', true);
  }
  text('家長姓名', true);
  if (INCLUDE_SENSITIVE_FIELDS) text('家長手機', true);
  choice('通報疾病', [
    '流感（含A型、B型、類流感）', '腸病毒、手足口症、皰疹性咽峽炎',
    '水痘', '紅眼症', '頭蝨', '疥瘡',
    '病毒性腸胃炎(如諾羅病毒、腺病毒出現腹瀉症狀)', '其他(衛福部公告法定傳染病)'
  ], true);
  date('出現症狀日期', true);
  text('症狀 (例如發燒  咳嗽  肌肉痠痛、 口腔潰瘍  手腳起水皰....)', true);
  date('就醫日期', true);
  text('就醫診所醫院', true);
  choice('是否有採檢?', ['是(須回答採檢結果)', '否'], false);
  text('採檢結果', false, '如有流感採檢，請填 A流或B流。');
  date('請假日期', true);
  choice('請假前一天是否有到校上課?', ['是', '否'], true);
  choice('是否有參加校外安親班?', ['是', '否', '校內課後照顧班'], true);
  text('校外安親班名稱', false);
  text('校外安親班電話', false);
  choice('是否有兄弟姊妹就讀本校?', ['是', '否'], true);
  text('兄弟姊妹就讀班級姓名(例如 3-4 陳天地)', false);
  choice('是否有施打流感疫苗', ['是', '否'], false);
  form.setConfirmationMessage('感謝填寫，健康中心將核對通報內容。返校與防疫措施請依醫療人員及學校通知辦理。');
  const sheet = SpreadsheetApp.create(SCHOOL_NAME + '傳染病通報表－回覆資料');
  sheet.setSpreadsheetTimeZone('Asia/Taipei');
  sheet.setSpreadsheetLocale('zh_TW');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, sheet.getId());
  Logger.log('表單編輯網址：' + form.getEditUrl());
  Logger.log('填答網址（核對並發布後才分享）：' + form.getPublishedUrl());
  Logger.log('回覆試算表（請保持限制存取）：' + sheet.getUrl());
}
