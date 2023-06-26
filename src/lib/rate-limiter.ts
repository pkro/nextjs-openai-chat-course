import {Ratelimit} from "@upstash/ratelimit";
import {redis} from "@/lib/redis";

export const rateLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(
        4, // 4 requests
        '10 s', // per 10 seconds
    ),
    prefix: '@upstash/ratelimit' // optional prefix to share instance with other applications and avoid key collisions
});

