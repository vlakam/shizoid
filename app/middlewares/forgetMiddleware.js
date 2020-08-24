module.exports = async (ctx, next) => {
    if (ctx.update.message) {
        if (Math.abs(ctx.update.message.date - Math.floor(Date.now() / 1000)) <= 5) {
            return next();
        }
    } else {
        return next();
    }
};