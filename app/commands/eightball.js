const models = require('../../models');
const { MessageProcessor } = require('../helpers/messageProcessor');
const _ = require('lodash');

const eightballAnswer = ['Бесспорно.',
    'Предрешено.',
    'Никаких сомнений.',
    'Определённо да.',
    'Можешь быть уверен в этом.',
    'Мне кажется — «да»',
    'Вероятнее всего.',
    'Хорошие перспективы.',
    'Знаки говорят — «да».',
    'Да.',
    'Пока не ясно.',
    'Cпроси завтра.',
    'Лучше не рассказывать.',
    'Сегодня нельзя предсказать.',
    'Сконцентрируйся и спроси опять.',
    'Даже не думай.',
    'Мой ответ — «нет».',
    'По моим данным — «нет».',
    'Перспективы не очень хорошие.',
    'Весьма сомнительно.'];

const setupEightballCommand = (bot) => {
    bot.hears(/\/eightball (.*)/, async (ctx) => {
        const [_a, text] = ctx.match;
        const message = new MessageProcessor(ctx, text);
    
        ctx.replyWithChatAction("typing");
        let additionalAnswer = await message.generateAnswer();
        return ctx.reply(`${_.sample(eightballAnswer)} ${additionalAnswer.join(' ')}`);
    })
}

module.exports = setupEightballCommand;