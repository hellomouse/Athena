class floodProtection {

    constructor(bot) {
        this.bot = bot;
        this.bot.sendQueue = [];

        setInterval(this.reduceQueue, 300, false);
        setInterval(this.reduceQueue, 3000, true);

        this.bot.send = message => {
            this.bot.sendQueue.push(message);
        };
    }

    reduceQueue(burst) {
        if (!this.bot.sendQueue) return;

        for (let i=0; i<4; i++) {
            let message = this.bot.sendQueue.shift();

            if (message) {
                this.bot.immediateSend(message);
            }
            if (!burst) break;
        }
    }

}

module.exports = floodProtection;
