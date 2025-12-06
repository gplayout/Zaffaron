
export class BaseAgent {
    constructor(name, config = {}) {
        this.name = name;
        this.config = config;
        this.logs = [];
    }

    log(message, type = 'INFO') {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] [${this.name}] [${type}]: ${message}`;
        console.log(logEntry);
        this.logs.push(logEntry);
    }

    async run(input) {
        throw new Error('run() method must be implemented by subclass');
    }
}
