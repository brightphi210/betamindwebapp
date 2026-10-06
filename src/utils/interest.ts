export type Interest = { id: string; name: string };

export const normalizeOptionName = (value: string) => value.trim().replace(/\s+/g, " ");

export const slugifyOption = (value: string) =>
    normalizeOptionName(value)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "custom";

export const buildOption = (name: string): Interest => ({
    id: slugifyOption(name),
    name: normalizeOptionName(name),
});

export const mergeOptions = (base: Interest[], extras: Interest[]) => {
    const map = new Map<string, Interest>();
    [...base, ...extras].forEach((option) => {
        const key = option.id || slugifyOption(option.name);
        if (!map.has(key)) map.set(key, { id: key, name: option.name });
    });
    return Array.from(map.values());
};

export const createCustomInterest = (value: string): Interest | null => {
    const name = normalizeOptionName(value);
    if (!name) return null;
    return buildOption(name);
};

export const INTEREST_OPTIONS: Interest[] = [
    { id: "ai-machine-learning", name: "AI & Machine Learning" },
    { id: "design", name: "Design" },
    { id: "career-growth", name: "Career Growth" },
    { id: "marketing", name: "Marketing" },
    { id: "finance", name: "Finance" },
    { id: "leadership", name: "Leadership" },
    { id: "wellness", name: "Wellness" },
    { id: "productivity", name: "Productivity" },
    { id: "technology", name: "Technology" },
    { id: "startups", name: "Startups" },
    { id: "public-speaking", name: "Public Speaking" },
    { id: "writing", name: "Writing" },
    { id: "research", name: "Research" },
    { id: "music", name: "Music" },
    { id: "fitness", name: "Fitness" },
    { id: "photography", name: "Photography" },
    { id: "mental-health", name: "Mental Health" },
    { id: "learning", name: "Learning" },
    { id: "strategy", name: "Strategy" },
    { id: "entrepreneurship", name: "Entrepreneurship" },
    { id: "software-engineering", name: "Software Engineering" },
    { id: "ux-ui", name: "UX / UI" },
    { id: "product-management", name: "Product Management" },
    { id: "data-science", name: "Data Science" },
    { id: "sales", name: "Sales" },
    { id: "operations", name: "Operations" },
    { id: "content-creation", name: "Content Creation" },
    { id: "networking", name: "Networking" },
    { id: "communication", name: "Communication" },
    { id: "mindset", name: "Mindset" },
    { id: "personal-branding", name: "Personal Branding" },
    { id: "coaching", name: "Coaching" },
    { id: "education", name: "Education" },
    { id: "podcasting", name: "Podcasting" },
    { id: "social-impact", name: "Social Impact" },
    { id: "creative-thinking", name: "Creative Thinking" },
    { id: "storytelling", name: "Storytelling" },
    { id: "travel", name: "Travel" },
    { id: "food", name: "Food" },
];

export const HARD_CODED_INTERESTS: Interest[] = INTEREST_OPTIONS;

export const CATEGORY_OPTIONS: Interest[] = [
    { id: "tech", name: "Tech" },
    { id: "finance", name: "Finance" },
    { id: "business", name: "Business" },
    { id: "design", name: "Design" },
    { id: "product", name: "Product" },
    { id: "marketing", name: "Marketing" },
    { id: "leadership", name: "Leadership" },
    { id: "education", name: "Education" },
    { id: "politics", name: "Politics" },
    { id: "media", name: "Media" },
    { id: "health", name: "Health" },
    { id: "lifestyle", name: "Lifestyle" },
    { id: "sports", name: "Sports" },
    { id: "entertainment", name: "Entertainment" },
    { id: "science", name: "Science" },
    { id: "career-growth", name: "Career Growth" },
    { id: "wellness", name: "Wellness" },
];

export const EXPERTISE_OPTIONS: Interest[] = [
    { id: "career-coaching", name: "Career Coaching" },
    { id: "resume-review", name: "Resume Review" },
    { id: "interview-prep", name: "Interview Prep" },
    { id: "public-speaking", name: "Public Speaking" },
    { id: "leadership-coaching", name: "Leadership Coaching" },
    { id: "technical-mentoring", name: "Technical Mentoring" },
    { id: "startup-advice", name: "Startup Advice" },
    { id: "product-strategy", name: "Product Strategy" },
    { id: "ux-design", name: "UX Design" },
    { id: "data-analysis", name: "Data Analysis" },
    { id: "marketing-strategy", name: "Marketing Strategy" },
    { id: "financial-planning", name: "Financial Planning" },
    { id: "personal-branding", name: "Personal Branding" },
    { id: "networking", name: "Networking" },
    { id: "time-management", name: "Time Management" },
    { id: "fundraising", name: "Fundraising" },
    { id: "coaching", name: "Coaching" },
    { id: "storytelling", name: "Storytelling" },
];

export const getHardcodedInterests = (): Interest[] => [...HARD_CODED_INTERESTS];

export const normalizeInterests = (raw: any): Interest[] => {
    const list = Array.isArray(raw) ? raw : raw?.results ?? [];
    return list
        .filter((i: any) => i?.id && i?.name)
        .map((i: any) => ({ id: String(i.id), name: String(i.name) }));
};

/** Profile interests may come back as objects, ids or names. Normalise to ids. */
export const extractInterestIds = (profileInterests: any, all: Interest[]): string[] => {
    if (!Array.isArray(profileInterests)) return [];
    return profileInterests
        .map((item) => {
            if (item && typeof item === "object") return String(item.id ?? item.interest?.id ?? "");
            const s = String(item);
            return all.find((i) => i.id === s || i.name.toLowerCase() === s.toLowerCase())?.id ?? "";
        })
        .filter(Boolean);
};

/** Same idea, but returns display names (used for Explore filtering). */
export const extractInterestNames = (profileInterests: any, all: Interest[]): string[] => {
    if (!Array.isArray(profileInterests)) return [];
    return profileInterests
        .map((item) => {
            if (item && typeof item === "object") {
                return item.name ?? item.interest?.name ?? all.find((i) => i.id === String(item.id))?.name ?? "";
            }
            const s = String(item);
            return all.find((i) => i.id === s)?.name ?? s;
        })
        .filter(Boolean);
};