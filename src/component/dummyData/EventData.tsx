export interface Attendee {
    name: string;
    avatar: string;
}

export interface RegisteredEvent {
    id: string;
    title: string;
    time: string;
    date: string;
    dateLabel: string; // e.g. "Today", "Wednesday", "Nov 15"
    location?: string;
    registered: number;
    thumbnail: string; // image url
    status: 'upcoming' | 'past';
    actionText: string;
    host?: string;
    hostAvatar?: string;
    hostEmail?: string;
    description?: string;
    attendees: Attendee[];
    publicUrl: string;
}

export const EVENTS: RegisteredEvent[] = [
    {
        id: '1',
        title: 'The Future of Quant Finance with AI',
        time: '2:00 PM',
        date: '2026-07-02',
        dateLabel: 'Today',
        location: 'Zoom',
        registered: 342,
        thumbnail: 'https://picsum.photos/seed/quantfinance/900/900',
        status: 'upcoming',
        actionText: 'Join Event',
        host: 'Quant Society',
        hostAvatar: 'https://i.pravatar.cc/64?img=12',
        hostEmail: 'hello@quantsociety.io',
        description: 'A deep dive into how AI is reshaping quantitative finance, from signal discovery to execution.',
        attendees: [
            { name: 'Ada Lovelace', avatar: 'https://i.pravatar.cc/64?img=5' },
            { name: 'Grace Hopper', avatar: 'https://i.pravatar.cc/64?img=9' },
            { name: 'Alan Turing', avatar: 'https://i.pravatar.cc/64?img=15' },
            { name: 'Katherine Johnson', avatar: 'https://i.pravatar.cc/64?img=25' },
            { name: 'John Nash', avatar: 'https://i.pravatar.cc/64?img=33' },
        ],
        publicUrl: '/events/1',
    },
    {
        id: '2',
        title: 'CyberSecurity Fundamentals for Developers',
        time: '10:00 AM',
        date: '2026-07-10',
        dateLabel: 'Friday',
        location: 'Main Auditorium',
        registered: 128,
        thumbnail: 'https://picsum.photos/seed/cybersecurity/900/900',
        status: 'upcoming',
        actionText: 'Join Event',
        host: 'DevSec Club',
        hostAvatar: 'https://i.pravatar.cc/64?img=18',
        hostEmail: 'contact@devsecclub.io',
        description: 'Hands-on session covering the security fundamentals every developer should know.',
        attendees: [
            { name: 'Linus Torvalds', avatar: 'https://i.pravatar.cc/64?img=22' },
            { name: 'Margaret Hamilton', avatar: 'https://i.pravatar.cc/64?img=28' },
            { name: 'Tim Berners-Lee', avatar: 'https://i.pravatar.cc/64?img=41' },
        ],
        publicUrl: '/events/2',
    },
    {
        id: '3',
        title: 'Global Economics Trends in the AI Era',
        time: '2:00 PM',
        date: '2026-06-18',
        dateLabel: 'Jun 18',
        location: 'Zoom',
        registered: 215,
        thumbnail: 'https://picsum.photos/seed/globaleconomics/900/900',
        status: 'past',
        actionText: 'View Recording',
        host: 'Econ Circle',
        hostAvatar: 'https://i.pravatar.cc/64?img=36',
        hostEmail: 'team@econcircle.io',
        description: 'A recap of the macro trends shaping global economics as AI adoption accelerates.',
        attendees: [
            { name: 'Adam Smith', avatar: 'https://i.pravatar.cc/64?img=47' },
            { name: 'Janet Yellen', avatar: 'https://i.pravatar.cc/64?img=44' },
            { name: 'Amartya Sen', avatar: 'https://i.pravatar.cc/64?img=51' },
            { name: 'Esther Duflo', avatar: 'https://i.pravatar.cc/64?img=29' },
        ],
        publicUrl: '/events/3',
    },
];