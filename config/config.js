module.exports.config = {
    token: '296642431:AAHxNkgJyWEXK8qS94BQ-OnTWv4dKxRwytg',
    myId: 296642431, // before : in token
    punctuation: {
        endSentence: '.!?',
        all: '.!?;:,'
    },
    db: {
        dialect: 'postgres',
        username: 'shizoid',
        password: 'shizoid',
        database: 'shizoid',
        host: 'localhost',
        port: 5432,
        logging: false
    },
    debug: false
};
