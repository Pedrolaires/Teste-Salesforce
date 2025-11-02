const mockShowToastEvent = jest.fn();

export const ShowToastEvent = class extends Event {
    constructor(eventData) {
        super('lightning__showtoast');
        Object.assign(this, eventData);
        mockShowToastEvent(eventData);
    }
};

export { mockShowToastEvent };