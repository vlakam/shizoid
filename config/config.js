module.exports.config = {
  token: process.env.TELEGRAMTOKEN,
  myId: parseInt(process.env.TELEGRAMTOKEN.split(":")[0]),
  punctuation: {
    endSentence: ".!?",
    all: ".!?;:,",
  },
  db: {
    dialect: "postgres",
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DBNAME,
    host: process.env.DB_HOST,
    port: 5432,
    logging: false,
  },
  debug: false,
};
