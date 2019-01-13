"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
const LogstashTransport_js_1 = __importDefault(require("./LogstashTransport.js"));
// import './css.scss'
const format = [
    winston_1.default.format.metadata({ server: 'EXPRESS' }),
    winston_1.default.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston_1.default.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
];
const options = {
    file: {
        level: 'info',
        filename: path_1.default.resolve(__dirname, 'logs/app.log'),
        handleExceptions: true,
        json: true,
        format: winston_1.default.format.combine(...format),
        maxsize: 5242880,
        maxFiles: 5,
        colorize: false
    },
    console: {
        // level: 'info',
        handleExceptions: true,
        json: true,
        format: winston_1.default.format.combine(winston_1.default.format.colorize(), ...format),
        colorize: false
    },
    logstash: {
        format: winston_1.default.format.combine(...format)
    }
};
const logger = winston_1.default.createLogger({
    level: process.env.NODE_ENV === 'development' ? 'verbose' : 'info',
    transports: [
        new winston_1.default.transports.File(options.file),
        new winston_1.default.transports.Console(options.console),
        // @ts-ignore
        new LogstashTransport_js_1.default({
            host: '127.0.0.1',
            port: 5000,
            ...options.logstash
        })
    ],
    exitOnError: false // do not exit on handled exceptions
});
console.log = message => {
    logger.info(message);
};
console.error = message => {
    logger.error(message);
};
class Application {
    constructor() {
        console.log('INITIATING...');
        this.app = express_1.default();
        this.app.use(body_parser_1.default.urlencoded({ extended: false }));
        this.app.use(body_parser_1.default.json());
        this.app.use('*', (req, res) => {
            res.send('OK');
        });
    }
    getApp() {
        return this.app;
    }
}
const application = new Application();
application.getApp().listen(3000, () => {
    console.log('LISTENING ON PORT 3000');
    /*
    setInterval(() => {
      console.log(`TESTING T:${Date.now().toString()}`)
    }, 2000)
    */
});
