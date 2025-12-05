const EventEmitter = require('events');

class SimpleQueue extends EventEmitter {
  constructor(processor) {
    super();
    this.processor = processor;
    this.queue = [];
    this.processing = false;
  }

  add(job) {
    return new Promise((resolve, reject) => {
      this.queue.push({ job, resolve, reject });
      this._processNext();
    });
  }

  async _processNext() {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;
    const { job, resolve, reject } = this.queue.shift();

    try {
      const result = await this.processor(job);
      this.emit('completed', job, result);
      resolve(result);
    } catch (err) {
      this.emit('failed', job, err);
      reject(err);
    } finally {
      this.processing = false;
      this._processNext();
    }
  }
}

module.exports = SimpleQueue;
