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
                    let words = _.map(response, function (element) {
                        return {
                            id: element.get('id'),
                            word: element.get('word')
                        }
                    });

                    while (_.size(words) >= 3) {
                        let triplet = _.take(words, 3);
                        words.shift();
                        let pair = (await self.findOrCreate({
                            where: {
                                ChatId: message.chat.get('id'),
                                firstId: triplet[0].id,
                                secondId: triplet[1].id
                            },
                            include: [{model: Reply, all: true}]
                        }))[0];

                        let reply = _.find(pair.Replies, function (reply) {
                            return reply.get('WordId') === triplet[2].id;
                        });

                        if (!reply) {
                            pair.createReply({
                                PairId: pair.get('id'),
                                WordId: (triplet[2] || {id: null}).id
                            })
                        } else {
                            reply.increment('counter');
                        }
                    }
                },
                getPair: async function (chatId, firstId, secondId) {
                    let self = this;
                    firstId = firstId || secondId;
                    let pair = await self.findAll({
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
                                limit: 3,
                                separate: false
                            }
                        ],
                        order: [
                            [sequelize.import('./reply'), 'counter', 'DESC']
                        ]
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
                    let sentences = _.random(1, 3);
                    let result = [];

                    let generateSentence = async function (message) {
                        let sentence = '';
                        let safety_counter = 50;
                        let firstWord = null;
                        let secondWord = wordIds;
                        let pair = await self.getPair(message.chat.get('id'), firstWord, secondWord);
                        while (pair && safety_counter) {
                            safety_counter--;
                            let reply = _.sample(_.sortBy(pair.Replies, function (reply) {
                                reply.get('counter');
                            }).reverse());
                            firstWord = pair.get('firstId');
                            secondWord = reply.get('WordId');
                            if (!_.size(sentence)) {
                                sentence = _.capitalize(pair.get('second').get('word') + ' ');
                                wordIds = _.difference(wordIds, [pair.get('second').get('id')])
                            }

                            if (_.size(reply.get('Word').get('word'))) {
                                sentence = sentence + reply.get('Word').get('word') + ' ';
                            } else {
                                break;
                            }
                            pair = await self.getPair(message.chat.id, firstWord, secondWord);
                        }

                        if(_.size(sentence)){
                            sentence = _.trim(sentence);
                            sentence += _.sample(config.punctuation.endSentence.split(''));
                        }

                        return sentence;
                    };

                    for(let i = 0; i < sentences; i++) {
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