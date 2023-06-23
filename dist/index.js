export default class EventStreamParser {
    dataBuffer = '';
    eventTypeBuffer = '';
    lastEventIdBuffer = '';
    parse(stream) {
        const events = [];
        const lines = stream.split(/\r\n|\r|\n/);
        for (let line of lines) {
            line = this.utf8Decode(line);
            if (line === '') {
                if (this.dataBuffer !== '') {
                    events.push(this.dispatchEvent());
                }
                continue;
            }
            if (line.startsWith(':')) {
                continue;
            }
            let field;
            let value = '';
            if (line.includes(':')) {
                const splitLine = line.split(':', 2);
                field = splitLine[0];
                value = splitLine[1];
                if (value.startsWith(' ')) {
                    value = value.slice(1);
                }
            }
            else {
                field = line;
            }
            this.processField(field, value);
        }
        return events;
    }
    utf8Decode(line) {
        if (line.charCodeAt(0) === 0xfeff) {
            return line.slice(1);
        }
        return line;
    }
    processField(field, value) {
        switch (field) {
            case 'event':
                this.eventTypeBuffer = value;
                break;
            case 'data':
                this.dataBuffer += value + '\n';
                break;
            case 'id':
                if (!value.includes('\0')) {
                    this.lastEventIdBuffer = value;
                }
                break;
            case 'retry':
                break;
            default:
        }
    }
    dispatchEvent() {
        if (this.dataBuffer.endsWith('\n')) {
            this.dataBuffer = this.dataBuffer.slice(0, -1);
        }
        const event = {
            type: this.eventTypeBuffer !== '' ? this.eventTypeBuffer : 'message',
            data: this.dataBuffer,
            lastEventId: this.lastEventIdBuffer,
        };
        this.dataBuffer = '';
        this.eventTypeBuffer = '';
        return event;
    }
}
//# sourceMappingURL=index.js.map