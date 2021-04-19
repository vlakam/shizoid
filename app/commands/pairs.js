const models = require('../../models');
const adminMiddleware = require('../middlewares/adminMiddleware');

const setupPairsCommand = (bot) => {
    bot.command('get_pairs', adminMiddleware, async (ctx) => {
        const chat = await models.Chat.getChat(ctx.message);
        const counter = await models.Pair.count({ where: { ChatId: chat.id } });

        return ctx.reply(`Known pairs for this chat: ${counter}`, { reply_to_message_id: ctx.message.message_id });
    });
};

module.exports = setupPairsCommand;
