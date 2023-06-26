// middleware for rate limiting requests to the nextjs /api
//https://nextjs.org/docs/pages/building-your-application/routing/middleware
import {NextRequest, NextResponse} from "next/server";
import {rateLimiter} from "@/lib/rate-limiter";
import {icssParser} from "next/dist/build/webpack/loaders/css-loader/src/plugins";

export async function middleware(req: NextRequest) {
    const ip = req.ip ?? '127.0.0.1';

    try {
        const {success} = await rateLimiter.limit(ip);
        if(!success) return new NextResponse('Too many messages in too short time')
        return NextResponse.next();
    } catch (e) {
        return new NextResponse('Sorry, something went wrong');
    }
}

export const config = {
    matcher: '/api/message/:path*' // match any path under api/message
}