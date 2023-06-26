export interface ParsedEvent {
  type: string;
  data: string;
  lastEventId: string;
}

export default class EventStreamParser {
  private dataBuffer: string = '';
  private eventTypeBuffer: string = '';
  private lastEventIdBuffer: string = '';

  public parse(stream: string): ParsedEvent[] {
    const events: any[] = [];
    const lines = stream.split(/\r\n|\r|\n/);

    for (let line of lines) {
      line = this.utf8Decode(line);

      // Blank line: Dispatch the event.
      if (line === '') {
        if (this.dataBuffer !== '') {
          events.push(this.dispatchEvent());
        }
        continue;
      }

      // Line starts with ":": Ignore the line.
      if (line.startsWith(':')) {
        continue;
      }

      let field: string;
      let value: string = '';

      // Line contains ":": Split on the first colon.
      if (line.includes(':')) {
        const splitLine = line.split(':', 2);
        field = splitLine[0];
        value = splitLine[1];
        if (value.startsWith(' ')) {
          value = value.slice(1);
        }
      } else {
        // Line does not contain a colon: The whole line is the field name.
        field = line;
      }

      this.processField(field, value);
    }

    return events;
  }

  private utf8Decode(line: string): string {
    // Here, we assume that the line is already in UTF-8 and we just remove the BOM if it exists.
    if (line.charCodeAt(0) === 0xfeff) {
      return line.slice(1);
    }
    return line;
  }

  private processField(field: string, value: string): void {
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
        // Not implemented: We do nothing for the "retry" field.
        break;
      default:
      // Field is ignored.
    }
  }

  private dispatchEvent(): ParsedEvent {
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
