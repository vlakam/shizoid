const models = require('../../models');
const adminMiddleware = require('../middlewares/adminMiddleware');

const setupGabCommands = (bot) => {
    setupSetGab(bot);
    setupGetGab(bot);
};

const setupGetGab = (bot) =>
    bot.command('get_gab', async (ctx) => {
        const chat = await models.Chat.getChat(ctx.message);
        return ctx.reply(chat.get('random_chance'), { reply_to_message_id: ctx.message.message_id });
    });

const setupSetGab = (bot) =>
    bot.hears(/^\/set_gab (\d+)/, adminMiddleware, async (ctx) => {
        const [_, gab] = ctx.match;
        const chat = await models.Chat.getChat(ctx.message);

        const chance = parseInt(gab);
        chat.set('random_chance', chance);
        chat.save();
        ctx.reply(`Setting gab to ${chance}`, { reply_to_message_id: ctx.message.message_id });
    });

module.exports = setupGabCommands;
