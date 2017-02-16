'use strict';
const {config} = require('../config/config.js');
const _ = require('lodash');
const sequence = require('promise-sequence');

module.exports = function (sequelize) {
    let Pair = sequelize.define('Pair', {}, {
            classMethods: {
                associate: function (models) {
                    Pair.belongsTo(models.Chat);
                    Pair.belongsTo(models.Word, {as: 'first'});
                    Pair.belongsTo(models.Word, {as: 'second'});
                    Pair.hasMany(models.Reply);
                },
                learn: function (message) {
                    let self = this;
                    let Word = sequelize.import('./word');
                    Word.learn(message.words).then(function (response) {
                        let words = message.words;

                        // while (_.size(words) >= 3) {
                        //     let triplet = _.take(words, 3);
                        //     words.shift();
                        //     let allWordsPromises = _.map(triplet, function (element) {
                        //         return Word.find({
                        //             where: {
                        //                 word: element
                        //             }
                        //         })
                        //     });
                        //     Promise.all(allWordsPromises).then(function (Words) {
                        //         //3
                        //         self.findOrCreate({
                        //             where: {
                        //                 ChatId: message.message.chat_id,
                        //                 firstId: Words[0].dataValues.id,
                        //                 secondId: Words[1].dataValues.id
                        //             },
                        //             include: [{model: sequelize.import('./reply'), all: true}]
                        //         }).then(function (pair) {
                        //             let reply = _.find(pair.replies, function (reply) {
                        //                 return reply.dataValues.WordId === Words[2].dataValues.id;
                        //             });
                        //             if (!reply) {
                        //                 sequelize.import('./reply').create({
                        //                     PairId: pair[0].dataValues.id,
                        //                     WordId: (Words[2] || {dataValues: {id: null}}).dataValues.id
                        //                 })
                        //             } else {
                        //                 reply.increment('counter');
                        //             }
                        //         });
                        //     }).catch(function (reason) {
                        //         console.log('learn failed: ', reason);
                        //     });
                        // }
                    });
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
                                if(!_.size(sentence)) {
                                    sentence = _.capitalize(pair.dataValues.second.word + ' ');
                                    wordIds = _.difference(wordIds, [pair.dataValues.second.id])
                                }

                                if(reply.dataValues.word.word) {
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