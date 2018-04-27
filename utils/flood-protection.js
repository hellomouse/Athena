class floodProtection {

    constructor (bot) {

        this.bot = bot;
        this.bot.sendQueue = [];

        setInterval(this.reduceQueue, 300, this, false);
        setInterval(this.reduceQueue, 3000, this, true);

        this.bot.send = (message) => {

            this.bot.sendQueue.push(message);

        }

    }

    reduceQueue (that, burst) {

        if (!that.bot.sendQueue) return;

        for (let i=0;i<4;i++) {
            let message = that.bot.sendQueue.shift();
            if (message) {
                that.bot.immediateSend(message);
            }
            if (!burst) break;
        }

    }

}

module.exports = floodProtection
