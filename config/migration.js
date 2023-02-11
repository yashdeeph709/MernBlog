const Sequelize = require('sequelize');
const { Umzug, SequelizeStorage } = require('umzug');
const path = require('path');

const runMigrations = async (options) => {
  // creates a basic sqlite database
  const sequelize = new Sequelize(
    options.database,
    options.user,
    options.password,
    {
      host: options.host,
      port: options.port,
      dialect: "postgres",
      dialectOptions: {
        multipleStatements: true,
      },
      pool: {
        max: 1,
        min: 0,
        idle: 10000,
      },
    }
  );
  console.log(path.join(__dirname, 'migrations/*.js'))
  const umzug = new Umzug({
    migrations: {
      glob: ['migrations/*.js', {cwd: __dirname}],
    },
    context: sequelize.getQueryInterface(),
    storage: new SequelizeStorage({sequelize}),
    logger: console,
  });

  // checks migrations and run them if they are not already applied
  const migrationFileList = await umzug.up();
  // eslint-disable-next-line no-console
  console.log(`All migrations performed successfully`, migrationFileList);

  return {
    status: `All migrations performed successfully`,
    migrationFiles: migrationFileList,
  };
};

module.exports = { runMigrations }