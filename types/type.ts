export type Event = {
    event_name: string;
    host_name: string;
    host_address: string;
    date: string;
    location: string;
    description: string;
    attendees?: string[];
}

export type ConciseEvent = {
    event_name: string;
    host_name: string;
    date: string;
    location: string;
    event_id: string;
    participants?: string[];
}

export type Attendee = {
    id: string;
    event_id: string;
    event_name: string;
    name: string;
    description: string;
    x_handle: string;
    tg_handle: string;
    friends: string[];
}