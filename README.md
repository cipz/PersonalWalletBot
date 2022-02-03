# Personal Wallet Bot

Another day another bot.
This Telegram bot has been made to keep track of personal incomes and expenses without the need of applications that force you to pay a premium fee to have functionalities such as device syncronization, backup, adding custom categories.
Instead, this bot is connected to a personal Google Sheets where all data is recorded, thus always backed up and available to all your personal Telegram clients.

## Google and Telegram

All in all the operations of this bot are simple, thus it does not require any particular environment to run in.
This is where [Google App Script](https://developers.google.com/apps-script/overview) comes into play: it allows seamless integration with Google Workspace and it can host and run JavaScript simple applications.
Telegram on the other hand offers so many functionalities for bots that it was an easy choice when thinking about the inerface for these functionalities.

The only code file is `PersonalWalletBot.gs`, which contains all the necessary functions that allow the bot to send data to the Google sheet file, get data and set recursive expenses/incomes to be recorded.
