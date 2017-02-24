'use strict';
const {config} = require('../config/config.js');
const _ = require('lodash');

module.exports = function (sequelize) {
    let Pair = sequelize.define('Pair', {}, {
            classMethods: {
                associate: function (models) {
                    Pair.belongsTo(models.Chat);
                    Pair.belongsTo(models.Word, {as: 'first'});
                    Pair.belongsTo(models.Word, {as: 'second'});
                    Pair.hasMany(models.Reply);
                },
                learn: async function (message) {
                    let self = this;
                    let Word = sequelize.import('./word');
                    let Reply = sequelize.import('./reply');
                    let response = await Word.learn(message.words);
                    let words = [null];
                    _.each(message.words, function (word) {
                        words.push(_.find(response, (el) => el.get('word') === word).get('id'));
                        if (_.indexOf(config.punctuation.endSentence, _.last(word)) >= 0) {
                            words.push(null);
                        }
                    });
                    if (_.last(words) !== null) words.push(null);

                    while (_.size(words)) {
                        let triplet = _.take(words, 3);
                        words.shift();
                        try {
                            let pair = (await self.findOrCreate({
                                where: {
                                    ChatId: message.chat.get('id'),
                                    firstId: triplet[0],
                                    secondId: triplet[1]
                                },
                                include: [{model: Reply, all: true}]
                            }))[0];


                            let reply = _.find(pair.Replies, function (reply) {
                                return reply.get('WordId') === triplet[2];
                            });

                            if (!reply) {
                                pair.createReply({
                                    PairId: pair.get('id'),
                                    WordId: triplet[2]
                                })
                            } else {
                                reply.increment('counter');
                            }

                        } catch (e) {
                            console.log(e);
                        }
                    }
                },
                getPair: async function (chatId, firstId, secondId) {
                    let self = this;
                    let pair = null;
                    pair = await self.findAll({
                        where: {
                            ChatId: chatId,
                            firstId: firstId,
                            secondId: secondId,
                            createdAt: {
                                $lt: new Date((!config.debug) ? new Date() - 10 * 60 * 1000 : new Date())
                            }
                        },
                        include: [
                            {
                                model: sequelize.import('./reply'),
                                all: true,
                                nested: true,
                                limit: 10,
                                separate: false
                            }
                        ],
                        order: [
                            [sequelize.import('./reply'), 'counter', 'DESC']
                        ],
                        limit: 10
                    });


                    return _.sample(pair);
                },
                generate: async function (message) {
                    let self = this;
                    let Word = sequelize.import('./word');
                    let usingWords = _.difference(message.words, config.punctuation.endSentence.split(''));

                    let response = await Word.findAll({
                        where: {
                            word: usingWords
                        }
                    });
                    let wordIds = _.map(response, function (result) {
                        return result.get('id');
                    });
                    let sentences = _.random(0, 3) + 1;
                    let result = [];

                    let generateSentence = async function (message) {
                        let sentence = '';
                        let safety_counter = 50;
                        let safeGetter = {get: () => null};
                        let firstWord = null;
                        let secondWord = wordIds;
                        let pair = await self.getPair(message.chat.get('id').toString(), firstWord, secondWord);
                        while (pair && safety_counter) {
                            safety_counter--;
                            let reply = _.sample(pair.Replies);
                            firstWord = (pair.get('second') || safeGetter).get('id');
                            secondWord = (reply.get('Word') || safeGetter).get('id');
                            if (!_.size(sentence)) {
                                sentence = _.capitalize((pair.get('second') || safeGetter).get('word') + ' ');
                                wordIds = _.difference(wordIds, [(pair.get('second') || safeGetter).get('id')])
                            }

                            if (_.size((reply.get('Word') || safeGetter).get('word'))) {
                                sentence = sentence + reply.get('Word').get('word') + ' ';
                            } else {
                                break;
                            }
                            pair = await self.getPair(message.chat.id.toString(), firstWord, secondWord);
                        }

                        if (_.size(sentence)) {
                            sentence = _.trim(sentence);
                            if (_.indexOf(config.punctuation.endSentence, _.last(sentence)) < 0) {
                                sentence += _.sample(config.punctuation.endSentence.split(''));
                            }
                        }

                        return sentence;
                    };

                    for (let i = 0; i < sentences; i++) {
                        let tempSentence = await generateSentence(message);
                        result.push(tempSentence);
                    }

                    return result;
                }
            }
        }
    );
    return Pair;
};