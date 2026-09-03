import { next } from '@vercel/functions';

// Runs on Vercel's Edge runtime by default — no extra config needed.
export const config = {
    matcher: '/events/:id',
};

// User agents used by link-preview crawlers. When a request matches one of
// these, we return static HTML with OG/Twitter tags instead of the SPA shell,
// because these bots read raw HTML and do NOT execute JavaScript.
const BOT_UA_REGEX =
    /facebookexternalhit|Facebot|Twitterbot|LinkedInBot|WhatsApp|TelegramBot|Slackbot|Discordbot|redditbot|Pinterest|SkypeUriPreview|vkShare|Applebot|Googlebot/i;

// TODO: point this at your real Django endpoint for a single event
// (whatever useGetEvent() calls under the hood).
const EVENT_API_URL = (id: string) => `https://api.betaminds.online/events/${id}/`;

const FALLBACK_IMAGE = 'https://betamindwebapp.vercel.app/og-default.png';

export default async function middleware(request: Request) {
    const userAgent = request.headers.get('user-agent') || '';

    // Not a known bot -> let the normal SPA handle it, no interception at all.
    if (!BOT_UA_REGEX.test(userAgent)) {
        return next();
    }

    const url = new URL(request.url);
    const match = url.pathname.match(/^\/events\/([^/]+)\/?$/);
    const eventId = match?.[1];

    if (!eventId) {
        return next();
    }

    try {
        const res = await fetch(EVENT_API_URL(eventId));
        if (!res.ok) return next();

        const event = await res.json();

        const title = escapeHtml(event.title || 'BetaMinds Event');
        const rawDescription = event.description || 'Join this event on BetaMinds.';
        const description = escapeHtml(
            rawDescription.length > 200 ? `${rawDescription.slice(0, 197)}...` : rawDescription
        );
        const image = event.image || FALLBACK_IMAGE;
        const pageUrl = url.toString();

        const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>${title}</title>
<meta name="description" content="${description}" />

<meta property="og:type" content="website" />
<meta property="og:site_name" content="BetaMinds" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
<meta property="og:image" content="${image}" />
<meta property="og:url" content="${pageUrl}" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${description}" />
<meta name="twitter:image" content="${image}" />
</head>
<body>
<p><a href="${pageUrl}">${title}</a></p>
</body>
</html>`;

        return new Response(html, {
            status: 200,
            headers: { 'content-type': 'text/html; charset=utf-8' },
        });
    } catch {
        // API hiccup -> don't block the bot, just let it fall through to the SPA.
        return next();
    }
}

function escapeHtml(str: string) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}