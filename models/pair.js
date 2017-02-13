'use strict';

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
                    Promise.all(Word.learn(message.words)).then(function () {
                        let words = message.words;

                        while (_.size(words)) {
                            let triplet = _.take(words, 3);
                            words.shift();
                            let allWordsPromises = _.map(triplet, function (element) {
                                return Word.find({
                                    where: {
                                        word: element
                                    }
                                })
                            });
                            Promise.all(allWordsPromises).then(function (Words) {
                                //3
                                self.findOrCreate({
                                    where: {
                                        ChatId: message.message.chat_id,
                                        firstId: Words[0].id,
                                        secondId: Words[1].id
                                    },
                                    include: [{model:sequelize.import('./reply'), all: true}]
                                }).then(function (pair) {
                                    let reply = _.find(pair.replies, function (reply) {
                                        return reply.dataValues.WordId === Words[2].id;
                                    });
                                    if(!reply) {
                                        sequelize.import('./reply').create({
                                            PairId: pair.dataValues.id,
                                            WordId: Words[2].id
                                        })
                                    }
                                });
                            });
                        }
                    });
                }
            }
        }
    );
    return Pair;
};