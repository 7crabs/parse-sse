export interface ParsedEvent {
    type: string;
    data: string;
    lastEventId: string;
}
export default class EventStreamParser {
    private dataBuffer;
    private eventTypeBuffer;
    private lastEventIdBuffer;
    parse(stream: string): ParsedEvent[];
    private utf8Decode;
    private processField;
    private dispatchEvent;
}
