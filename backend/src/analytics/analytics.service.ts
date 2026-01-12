import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

interface ProfileData {
    username: string;
    followers: number;
    following?: number;
    posts?: number;
    engagementRate?: number;
    avgLikes?: number;
    avgComments?: number;
    avgViews?: number;
    avatarUrl?: string;
}

@Injectable()
export class AnalyticsService {
    constructor(
        private prisma: PrismaService,
        private configService: ConfigService,
    ) { }

    async trackProfile(userId: number, platform: string, profileUrl: string) {
        const username = this.extractUsername(platform, profileUrl);
        if (!username) {
            throw new BadRequestException('Invalid profile URL');
        }

        const existing = await this.prisma.trackedProfile.findUnique({
            where: { userId_platform_username: { userId, platform, username } },
        });

        if (existing) {
            return existing;
        }

        const profileData = await this.scrapeProfileData(platform, username);

        const profile = await this.prisma.trackedProfile.create({
            data: {
                userId,
                platform,
                username,
                profileUrl,
                avatarUrl: profileData.avatarUrl,
            },
        });

        await this.prisma.analyticsSnapshot.create({
            data: {
                profileId: profile.id,
                followers: profileData.followers,
                following: profileData.following,
                posts: profileData.posts,
                engagementRate: profileData.engagementRate,
                avgLikes: profileData.avgLikes,
                avgComments: profileData.avgComments,
                avgViews: profileData.avgViews,
            },
        });

        return profile;
    }

    async getTrackedProfiles(userId: number) {
        return this.prisma.trackedProfile.findMany({
            where: { userId, isActive: true },
            include: {
                snapshots: {
                    orderBy: { createdAt: 'desc' },
                    take: 30,
                },
            },
        });
    }

    async getProfileAnalytics(userId: number, profileId: number) {
        const profile = await this.prisma.trackedProfile.findFirst({
            where: { id: profileId, userId },
            include: {
                snapshots: {
                    orderBy: { createdAt: 'desc' },
                    take: 90,
                },
            },
        });

        if (!profile) {
            throw new NotFoundException('Profile not found');
        }

        const snapshots = profile.snapshots.reverse();
        const latestSnapshot = profile.snapshots[0];
        const previousSnapshot = profile.snapshots[1];

        const growth = previousSnapshot
            ? ((latestSnapshot.followers - previousSnapshot.followers) / previousSnapshot.followers) * 100
            : 0;

        const bestPostingTimes = this.calculateBestPostingTimes(snapshots);
        const growthVelocity = this.calculateGrowthVelocity(snapshots);

        return {
            profile,
            snapshots,
            stats: {
                currentFollowers: latestSnapshot?.followers || 0,
                growth: growth.toFixed(2),
                engagementRate: latestSnapshot?.engagementRate || 0,
                avgLikes: latestSnapshot?.avgLikes || 0,
                avgComments: latestSnapshot?.avgComments || 0,
                growthVelocity,
                bestPostingTimes,
            },
        };
    }

    async compareProfiles(userId: number, profileIds: number[]) {
        const profiles = await this.prisma.trackedProfile.findMany({
            where: { id: { in: profileIds }, userId },
            include: {
                snapshots: {
                    orderBy: { createdAt: 'desc' },
                    take: 30,
                },
            },
        });

        return profiles.map((p) => ({
            id: p.id,
            username: p.username,
            platform: p.platform,
            avatarUrl: p.avatarUrl,
            currentFollowers: p.snapshots[0]?.followers || 0,
            engagementRate: p.snapshots[0]?.engagementRate || 0,
            growth: this.calculateGrowthPercent(p.snapshots),
        }));
    }

    async refreshProfileData(userId: number, profileId: number) {
        const profile = await this.prisma.trackedProfile.findFirst({
            where: { id: profileId, userId },
        });

        if (!profile) {
            throw new NotFoundException('Profile not found');
        }

        const profileData = await this.scrapeProfileData(profile.platform, profile.username);

        await this.prisma.analyticsSnapshot.create({
            data: {
                profileId: profile.id,
                followers: profileData.followers,
                following: profileData.following,
                posts: profileData.posts,
                engagementRate: profileData.engagementRate,
                avgLikes: profileData.avgLikes,
                avgComments: profileData.avgComments,
                avgViews: profileData.avgViews,
            },
        });

        return { success: true };
    }

    async deleteTrackedProfile(userId: number, profileId: number) {
        const profile = await this.prisma.trackedProfile.findFirst({
            where: { id: profileId, userId },
        });

        if (!profile) {
            throw new NotFoundException('Profile not found');
        }

        await this.prisma.trackedProfile.delete({ where: { id: profileId } });
        return { success: true };
    }

    private extractUsername(platform: string, url: string): string | null {
        const patterns: Record<string, RegExp> = {
            instagram: /(?:instagram\.com|instagr\.am)\/([a-zA-Z0-9_.]+)/,
            tiktok: /tiktok\.com\/@?([a-zA-Z0-9_.]+)/,
            youtube: /(?:youtube\.com\/@|youtube\.com\/c\/|youtube\.com\/channel\/)([a-zA-Z0-9_-]+)/,
            twitter: /(?:twitter\.com|x\.com)\/([a-zA-Z0-9_]+)/,
        };

        const match = url.match(patterns[platform]);
        return match ? match[1] : null;
    }

    private async scrapeProfileData(platform: string, username: string): Promise<ProfileData> {
        const rapidApiKey = this.configService.get<string>('RAPIDAPI_KEY');

        if (rapidApiKey) {
            try {
                return await this.fetchFromRapidAPI(platform, username, rapidApiKey);
            } catch (error) {
                console.error(`Failed to fetch from RapidAPI for ${platform}/${username}:`, error);
                throw new BadRequestException('Failed to fetch profile data. Please try again later.');
            }
        }

        throw new BadRequestException(
            'Profile analytics requires RAPIDAPI_KEY to be configured in environment variables.',
        );
    }

    private async fetchFromRapidAPI(
        platform: string,
        username: string,
        apiKey: string,
    ): Promise<ProfileData> {
        const endpoints: Record<string, { host: string; path: string }> = {
            instagram: {
                host: 'instagram-scraper-api2.p.rapidapi.com',
                path: `/v1/info?username_or_id_or_url=${username}`,
            },
            tiktok: {
                host: 'tiktok-scraper7.p.rapidapi.com',
                path: `/user/info?unique_id=${username}`,
            },
            youtube: {
                host: 'youtube-v31.p.rapidapi.com',
                path: `/channels?part=statistics,snippet&forUsername=${username}`,
            },
            twitter: {
                host: 'twitter241.p.rapidapi.com',
                path: `/user?username=${username}`,
            },
        };

        const endpoint = endpoints[platform];
        if (!endpoint) {
            throw new BadRequestException(`Unsupported platform: ${platform}`);
        }

        const response = await axios.get(`https://${endpoint.host}${endpoint.path}`, {
            headers: {
                'X-RapidAPI-Key': apiKey,
                'X-RapidAPI-Host': endpoint.host,
            },
        });

        return this.parseProfileResponse(platform, username, response.data);
    }

    private parseProfileResponse(platform: string, username: string, data: any): ProfileData {
        switch (platform) {
            case 'instagram':
                return {
                    username,
                    followers: data.data?.follower_count || 0,
                    following: data.data?.following_count || 0,
                    posts: data.data?.media_count || 0,
                    engagementRate: this.calculateEngagement(
                        data.data?.follower_count || 0,
                        data.data?.edge_owner_to_timeline_media?.edges || [],
                    ),
                    avgLikes: this.calculateAvgLikes(data.data?.edge_owner_to_timeline_media?.edges || []),
                    avatarUrl: data.data?.profile_pic_url_hd || data.data?.profile_pic_url,
                };

            case 'tiktok':
                return {
                    username,
                    followers: data.data?.stats?.followerCount || 0,
                    following: data.data?.stats?.followingCount || 0,
                    posts: data.data?.stats?.videoCount || 0,
                    avgLikes: data.data?.stats?.heartCount || 0,
                    avgViews: data.data?.stats?.videoCount > 0
                        ? Math.floor((data.data?.stats?.heartCount || 0) / data.data.stats.videoCount * 10)
                        : 0,
                    avatarUrl: data.data?.user?.avatarLarger || data.data?.user?.avatarMedium,
                };

            case 'youtube':
                const channel = data.items?.[0];
                return {
                    username,
                    followers: parseInt(channel?.statistics?.subscriberCount || '0', 10),
                    posts: parseInt(channel?.statistics?.videoCount || '0', 10),
                    avgViews: parseInt(channel?.statistics?.viewCount || '0', 10),
                    avatarUrl: channel?.snippet?.thumbnails?.high?.url,
                };

            case 'twitter':
                return {
                    username,
                    followers: data.result?.legacy?.followers_count || 0,
                    following: data.result?.legacy?.friends_count || 0,
                    posts: data.result?.legacy?.statuses_count || 0,
                    avatarUrl: data.result?.legacy?.profile_image_url_https?.replace('_normal', '_400x400'),
                };

            default:
                throw new BadRequestException(`Unsupported platform: ${platform}`);
        }
    }

    private calculateEngagement(followers: number, posts: any[]): number {
        if (!posts.length || !followers) return 0;
        const totalLikes = posts.reduce((sum, p) => sum + (p.node?.edge_liked_by?.count || 0), 0);
        const avgLikes = totalLikes / posts.length;
        return parseFloat(((avgLikes / followers) * 100).toFixed(2));
    }

    private calculateAvgLikes(posts: any[]): number {
        if (!posts.length) return 0;
        const totalLikes = posts.reduce((sum, p) => sum + (p.node?.edge_liked_by?.count || 0), 0);
        return Math.floor(totalLikes / posts.length);
    }

    private calculateBestPostingTimes(snapshots: any[]): string[] {
        if (snapshots.length < 7) {
            return ['9:00 AM', '12:00 PM', '7:00 PM', '9:00 PM'];
        }

        const timeEngagement: Record<string, number[]> = {};
        snapshots.forEach((snap) => {
            const hour = new Date(snap.createdAt).getHours();
            const timeSlot = this.formatTimeSlot(hour);
            if (!timeEngagement[timeSlot]) timeEngagement[timeSlot] = [];
            if (snap.engagementRate) {
                timeEngagement[timeSlot].push(snap.engagementRate);
            }
        });

        const avgEngagement = Object.entries(timeEngagement)
            .map(([time, rates]) => ({
                time,
                avg: rates.reduce((a, b) => a + b, 0) / rates.length,
            }))
            .sort((a, b) => b.avg - a.avg);

        return avgEngagement.slice(0, 4).map((t) => t.time);
    }

    private formatTimeSlot(hour: number): string {
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:00 ${period}`;
    }

    private calculateGrowthVelocity(snapshots: any[]): number {
        if (snapshots.length < 2) return 0;
        const first = snapshots[0];
        const last = snapshots[snapshots.length - 1];
        const days = Math.ceil(
            (new Date(last.createdAt).getTime() - new Date(first.createdAt).getTime()) /
            (1000 * 60 * 60 * 24),
        );
        return days > 0 ? Math.floor((last.followers - first.followers) / days) : 0;
    }

    private calculateGrowthPercent(snapshots: any[]): number {
        if (snapshots.length < 2) return 0;
        const latest = snapshots[0];
        const previous = snapshots[snapshots.length - 1];
        return parseFloat(
            (((latest.followers - previous.followers) / previous.followers) * 100).toFixed(2),
        );
    }
}
