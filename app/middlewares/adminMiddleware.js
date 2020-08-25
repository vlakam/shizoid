const adminMiddleware = async (ctx, next) => {
    if ((ctx.chat.type === 'group' || ctx.chat.type === 'supergroup') && ctx.from) {
        const { id: chatId } = ctx.chat;

        const admins = await ctx.telegram.getChatAdministrators(chatId);

        if (admins.some((admin) => admin.user.id === ctx.from.id)) {
            return next();
        }
    } else {
        return next();
    }
};

module.exports = adminMiddleware;
