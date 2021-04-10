import { ConnectionOptions } from 'typeorm';

const config: Readonly<ConnectionOptions> = {
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "",
    database: "serkan",
    synchronize: process.env.NODE_ENV !== "production",
    logging: false,
    entities: [
        "dist/entity/**/*.js"
    ],
    migrations: [
        "dist/migration/**/*.js"
    ],
    subscribers: [
        "dist/subscriber/**/*.js"
    ]
};

export default config;