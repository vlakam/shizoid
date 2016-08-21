const telegramBot = require('node-telegram-bot-api');
const { config } = require('../config/config.js');
const models = require('../models');

var bot = new telegramBot(config.token, { polling: true });
bot.getMe().then(function (data) {
    config.myId = data.id;
});

models.sequelize.sync().then(function () {
    console.log('DB Initialisation successfull');
    bot.onText(/\/echo (.+)/, function (msg, match) {
        var fromId = msg.from.id;
        var resp = match[1];
        bot.sendMessage(fromId, resp);
    });

    bot.on('message', onNewMessage);
    bot.on('new_chat_participant', function (msg) {
        if (msg.new_chat_participant.id === config.myId) {
            invitedToNewChat(msg.chat);
        }
    })
}, function (error) {
    console.log(error);
});

function onNewMessage(msg) {
    console.log(msg);
    var chatId = msg.chat.id;
}

function invitedToNewChat(chat) {
    console.log(chat);
}