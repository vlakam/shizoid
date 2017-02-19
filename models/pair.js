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
                getPair: function (chatId, firstId, secondId) {
                    let self = this;
                    return self.find({
                        where: {
                            ChatId: chatId,
                            firstId: firstId,
                            secondId: secondId,
                            createdAt: {
                                $lt: new Date(new Date() - 10 * 60 * 1000)
                            }
                        },
                        include: [
                            {
                                model: sequelize.import('./reply'),
                                all: true,
                                limit: 3,
                                separate: false
                            }
                        ],
                        order: [
                            [sequelize.import('./reply'), 'counter', 'DESC']
                        ],
                        limit: 3
                    })
                },
                generate: async function (message) {
                    let self = this;
                    let Word = sequelize.import('./word');
                    let Reply = sequelize.import('./reply');
                    let usingWords = _.difference(message.words, config.punctuation.endSentence.split(''));

                    return Word.findAll({
                        where: {
                            word: usingWords
                        }
                    }).then(function (results) {
                        let wordIds = _.map(results, function (result) {
                            return result.dataValue.id;
                        });
                        let sentences = _.random(1, 3);

                        let generateSentence = async(message) => {
                            let sentence = '';
                            let safety_counter = 50;
                            let firstWord = null;
                            let secondWord = wordIds;
                            let pair = null;
                            while (pair = await self.getPair(message.chat.id, firstWord, secondWord) && safety_counter) {
                                safety_counter--;
                                let reply = _.sample(pair.replies);
                                firstWord = pair.dataValues.first.id;
                                secondWord = reply.dataValues.word.id;
                                if (!_.size(sentence)) {
                                    sentence = _.capitalize(pair.dataValues.second.word + ' ');
                                    wordIds = _.difference(wordIds, [pair.dataValues.second.id])
                                }

                                if (reply.dataValues.word.word) {
                                    sentence = sentence + reply.dataValues.word.word + ' ';
                                } else {
                                    break;
                                }
                            }

                            sentence = _.trim(sentence);

                            return sentence;
                        };


                        return sequence(_.times(sentences, _.partial(generateSentence, message)));
                    });
                }
            }
        }
    );
    return Pair;
};