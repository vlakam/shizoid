(function() {
    const telegramBot = require('node-telegram-bot-api');
    const {config} = require('../config/config.js');
    const models = require('../models');
    const CommandParser = require('./commandParser.js');
    const token = config.token || process.argv[2];
    const Message = require('./message.js');

    let bot = new telegramBot(token, {polling: true});
    let commandParser = new CommandParser(bot);
    bot.getMe().then(function (me) {
        bot.me = me;
    });

    models.sequelize.sync().then(function () {
        console.log('DB Initialisation successfull');
        process.on('exit', exitHandler);
        process.on('SIGINT', exitHandler);
        process.on('uncaughtException', exitHandler);

        bot.on('message', onNewMessage);
    }, function (error) {
        console.log(error);
    });

    function onNewMessage(msg) {
        if (commandParser.isCommand(msg)) {
            commandParser.process(msg);
        } else {
            try {
                new Message(bot, msg).process();
            } catch (e) {
                console.log(e);
            }
        }
    }

    function exitHandler() {
        models.sequelize.close();
        process.exit(0);
    }
})();
