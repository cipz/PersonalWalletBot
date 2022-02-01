var personal_chat_id = "";
var bot_token = "";
var telegram_url = "https://api.telegram.org/bot" + bot_token;
var webapp_url = "";
var spreadheet_id = "";

var current_year = Utilities.formatDate(new Date(), "GMT+1", "yyyy");
var current_month = Utilities.formatDate(new Date(), "GMT+1", "MM");
var current_day = Utilities.formatDate(new Date(), "GMT+1", "dd");

var currency = "€"

var exact_date_column = "A";
var month_column = "B";
var amount_column = "D";
var category_column = "E";
var notes_column = "F";

var inline_expense_categories_keyboard = {
  "inline_keyboard": [
    [{ "text": "💸 Bills", "callback_data": "ex Bills" }],
    [{ "text": "🏎 Car", "callback_data": "ex Car" }],
    [{ "text": "🧦 Clothes", "callback_data": "ex Clothes" }],
    [{ "text": "📱 Communications", "callback_data": "ex Communications" }],
    [{ "text": "🍔 Eating out", "callback_data": "ex Eating out" }],
    [{ "text": "🥕 Groceries", "callback_data": "ex Groceries" }],
    [{ "text": "🎥 Entertainment", "callback_data": "ex Entertainment" }],
    [{ "text": "🎁 Gifts", "callback_data": "ex Gifts" }],
    [{ "text": "🏥 Health", "callback_data": "ex Health" }],
    [{ "text": "🏡 House", "callback_data": "ex House" }],
    [{ "text": "🏃 Sports", "callback_data": "ex Sports" }],
    [{ "text": "🦙 Transport", "callback_data": "ex Transport" }]
  ]
}

var inline_income_categories_keyboard = {
  "inline_keyboard": [
    [{ "text": "💰 Deposit", "callback_data": "in Deposit" }],
    [{ "text": "💳 Salary", "callback_data": "in Salary" }],
    [{ "text": "🪙 Savings", "callback_data": "in Savings" }]
  ]
}

// Creates web hook to the telegram bot
function setWebhook() {
  var url = telegram_url + "/setWebhook?url=" + webapp_url;
  var response = UrlFetchApp.fetch(url);
  Logger.log(response.getContentText())
}

function sendImage(chat_id, img_url, caption) {

  let data = {
    method: "post",
    payload: {
      method: "sendPhoto",
      chat_id: String(chat_id),
      photo: String(img_url),
      caption: String(caption),
      parse_mode: 'HTML'
    }
  }
  var response = UrlFetchApp.fetch(telegram_url + '/', data);
  return response;
}

function sendMessage(chat_id, text, keyboard) {
  var data = {
    method: "post",
    payload: {
      method: "sendMessage",
      chat_id: String(chat_id),
      text: text,
      parseMode: "HTML",
      reply_markup: JSON.stringify(keyboard)
    }
  }
  var response = UrlFetchApp.fetch(telegram_url + '/', data);
  return response;
}

// Returns index of the last row with content
function getLastRow(active_sheet, range_string){
  
  var range = active_sheet.getRange(range_string).getValues();
  var last_row_index = 0;

  for(var i = last_row_index; i < range.length; i++){
    last_row_index = i
    if(range[i].every(function(c){ return c == "" ; })){
      break;
    }
  }
  return last_row_index+1;
}

function doPost(e) {

  var contents = JSON.parse(e.postData.contents);

  // If the contents are a message, this means it is either the first value or the note of the previously sent value
  if (contents.message) {
    
    // Always check the id!
    var chat_id = contents.message.from.id;
    if (chat_id != personal_chat_id) {
      Logger.log("Someone with chat_id " + chat_id + " tried to access the bot.");
      return;
    }

    var new_message = contents.message.text;

    // If it is a command
    if (new_message[0] == "/"){
      switch (new_message)  {
        case "/get_expenses_chart":
          getExpensesChart();
          break;
        case "/get_last_10_expenses":
          getLastExpenses(10, "Last 10 expenses:");
          break;
        case "/get_month_expenses":
          getMonthExpenses(current_month, "Current month expenses:");
          break;
        //default:
        //    break;
      }
      return;
    }

    var sheet = SpreadsheetApp.openById(spreadheet_id).getSheetByName(current_year);
    var last_row_index = getLastRow(sheet, "A2:"+notes_column);

    if ((last_row_index > 1) && (sheet.getRange(notes_column+last_row_index).isBlank())){
      sheet.getRange(notes_column+last_row_index).setValue(new_message);
      sendMessage(chat_id, "All set chief! 👍🏻")
      return;
    }

    if (isNaN(new_message)) {
      sendMessage(chat_id, "I didn't get that. What did you mean with '" + new_message + "'?");
      return;
    }

    // Check the amount of the new message
    if (new_message == 0) {
      sendMessage(chat_id, new_message + " is not a correct value.");
      return;
    } else if (new_message > 0) {
      sendMessage(chat_id, "Nice! Select income category", inline_income_categories_keyboard);
    } else {
      sendMessage(chat_id, "Select expense category", inline_expense_categories_keyboard);
    }
    // sheet.appendRow([new Date(), current_month, current_day, new_message]);
    new_message = String(new_message).replace(".",",");
    sheet.appendRow(["", current_month, current_day, currency + " " + new_message]);

  // If the contens are the answer to a previosly sent inline keyboard button
  } else if (contents.callback_query) {

    // Always check the id!
    var chat_id = contents.callback_query.from.id;
    if (chat_id != personal_chat_id) {
      Logger.log("Someone with chat_id " + chat_id + " tried to access the bot.");
      return;
    }

    var sheet = SpreadsheetApp.openById(spreadheet_id).getSheetByName(current_year);
    var last_row_index = getLastRow(sheet, "A2:"+notes_column);

    var msg_preamble = contents.callback_query.data.split(" ")[0];
    var message = contents.callback_query.data.split(" ")[1];

    // If the note cell is empty, the user can still edit the category since he might have changed his mind
    if (sheet.getRange(notes_column+last_row_index).isBlank()){
      sheet.getRange(category_column+last_row_index).setValue(message);
      if (msg_preamble == "ex") {
        sendMessage(chat_id, "What did you buy this time? 🤦‍♂️");
      } else if (msg_preamble == "in") {
        sendMessage(chat_id, "Where did you get the money from? 🧐");
      }
    } else {
      sendMessage(chat_id, "⚠️ Category already set ⚠️");
    }
  }
}

function getExpensesChart(){

  var sheet = SpreadsheetApp.openById(spreadheet_id).getSheetByName(current_year);

  // Get chart and save it into your Drive
  var chart = sheet.getCharts()[0];
  var file = DriveApp.createFile(chart.getBlob());
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.EDIT);
  var file_url = "https://docs.google.com/uc?id=" + file.getId();

  var caption = "💸💸 " + current_year + " expenses up to " + current_day + "/" + current_month + " 💸💸";

  sendImage(personal_chat_id, file_url, caption);

  Utilities.sleep(5000);
  file.setTrashed(true);

}

function getLastExpenses(expenses_num, message_start){

  var sheet = SpreadsheetApp.openById(spreadheet_id).getSheetByName(current_year);

  var message = message_start + "\n\n";
  var curr_row = getLastRow(sheet, "A2:"+notes_column);

  while ((expenses_num > 0) && (curr_row > 2)){

    var amount = sheet.getRange(amount_column+curr_row).getValue();
    var note = sheet.getRange(notes_column+curr_row).getValue();

    var emoji = "🟢";
    if (amount < 0){
      emoji = "🔴";
    }

    // Latest expenses are first
    message += emoji + " " + amount + " " + note + "\n";
    
    expenses_num--;
    curr_row--;
  }

  sendMessage(personal_chat_id, message);

}

function getMonthExpenses(month, message_start){

  var sheet = SpreadsheetApp.openById(spreadheet_id).getSheetByName(current_year);

  var message = message_start + "\n\n";
  var curr_row = getLastRow(sheet, "A2:"+notes_column);
  var month_curr_row = sheet.getRange(month_column+curr_row).getValue();

  while ((month_curr_row == month) && (curr_row > 2)){
    
    var amount = sheet.getRange(amount_column+curr_row).getValue();
    var note = sheet.getRange(notes_column+curr_row).getValue();

    var emoji = "🟢";
    if (amount < 0){
      emoji = "🔴";
    }

    // Latest expenses are first
    message += emoji + " " + amount + " " + note + "\n";
    
    curr_row--;
    month_curr_row = sheet.getRange(month_column+curr_row).getValue();

  }

  sendMessage(personal_chat_id, message); 

}
