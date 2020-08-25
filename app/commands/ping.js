const setupCommands = require('.');

const setupPingCommand = (bot) =>
    bot.command('ping', (ctx) =>
        ctx.reply('Pong!', {
            reply_to_message_id: ctx.message.message_id,
        }),
    );

module.exports = setupPingCommand;
