class floodProtection {

    constructor (bot) {

        //return

        this.bot = bot;
        this.bot.sendQueue = [];
        this.bot.immediateSend = this.bot.send // preserve send

        setInterval(this.reduceQueue, 300, this, false);
        setInterval(this.reduceQueue, 3000, this, true);

        this.bot.send = (message) => {

            this.bot.sendQueue.push(message);
            //await reduceQueue()

        }

    }

    reduceQueue (that, burst) {

        if (!that.bot.sendQueue) return;

        for (let i=0;i<4;i++) {
            let message = that.bot.sendQueue.shift();
            if (message) {
                message = (burst && message.split(' ')[0] == 'PRIVMSG') ? message + ' (burst)' : message;
                that.bot.immediateSend(message);
            }
            if (!burst) break;
        }

    }

}

module.exports = floodProtection
