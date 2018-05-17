/**
* Throttles messages sent by bot
* @class
*/
class FloodProtection {

    /**
    * @param {Bot} bot
    */
    constructor(bot) {
        this.bot = bot;
        this.bot.sendQueue = [];
        this.canBurst = false;
        this.burstLength = 4;

        setInterval(this.reduceQueue, 700, this);

        /**
        * @func
        * @param {string} message - Message to send (non-flushable)
        **/
        this.bot.send = message => {
            this.bot.sendQueue.push({ message, root: true, target: this.getTarget(message) });
        };

        /**
        * @func
        * @param {string} message - Message to send from plugin (flushable)
        **/
        this.bot._send = message => {
            this.bot.sendQueue.push({ message, root: false, target: this.getTarget(message) });
        };
    }

    /** Deletes all messages except those that aren't set by plugins **/
    flushAll() {
        this.bot.sendQueue = this.bot.sendQueue.map(element => element.root ? element : undefined);
    }

    /**
    * Flush messages for a target
    * @param {string} target
    **/
    flushTarget(target) {
        this.bot.sendQueue = this.bot.sendQueue.map(e => (e.target !== target && e.root) ? e : undefined);
    }

    /**
    * @func
    * @param {string} message
    * @return {string}
    **/
    getTarget(message) {
        if (!message) return;
        let splitMessage = message.split(' ');

        if (splitMessage.length > 1) return splitMessage[1];
    }

    /**
    * @func
    * @param {object} that
    **/
    reduceQueue(that) {
        if (that.bot.sendQueue.length === 0) {
            that.canBurst = true;
        } else if (that.canBurst) {
            let i = 0;

            while (i <= that.burstLength) {
                let message = that.bot.sendQueue.shift();

                if (!message) break;
                that.bot.immediateSend(message.message);
                that.canBurst = false;
                i++;
            }
        } else {
            let message = that.bot.sendQueue.shift();

            if (!message) return;
            that.bot.immediateSend(message.message);
            that.canBurst = false;
        }
    }

}

module.exports = FloodProtection;
