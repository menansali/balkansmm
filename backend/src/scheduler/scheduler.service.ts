import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';

interface CreatePostDto {
    platform: string;
    postType: string;
    caption: string;
    mediaUrls: string[];
    hashtags: string[];
    scheduledAt: string;
    timezone?: string;
    autoBoost?: boolean;
    boostServiceId?: number;
    boostQuantity?: number;
}

interface GenerateCaptionDto {
    topic: string;
    tone: string;
    platform: string;
    includeEmojis: boolean;
    includeHashtags: boolean;
}

@Injectable()
export class SchedulerService {
    constructor(
        private prisma: PrismaService,
        private configService: ConfigService,
    ) { }

    async createScheduledPost(userId: number, data: CreatePostDto) {
        const scheduledAt = new Date(data.scheduledAt);

        if (scheduledAt <= new Date()) {
            throw new BadRequestException('Scheduled time must be in the future');
        }

        return this.prisma.scheduledPost.create({
            data: {
                userId,
                platform: data.platform,
                postType: data.postType,
                caption: data.caption,
                mediaUrls: data.mediaUrls,
                hashtags: data.hashtags,
                scheduledAt,
                timezone: data.timezone || 'UTC',
                autoBoost: data.autoBoost || false,
                boostServiceId: data.boostServiceId,
                boostQuantity: data.boostQuantity,
            },
        });
    }

    async getScheduledPosts(userId: number, status?: string) {
        const where: any = { userId };
        if (status) where.status = status;

        return this.prisma.scheduledPost.findMany({
            where,
            orderBy: { scheduledAt: 'asc' },
        });
    }

    async getPost(userId: number, postId: number) {
        const post = await this.prisma.scheduledPost.findFirst({
            where: { id: postId, userId },
        });

        if (!post) throw new NotFoundException('Post not found');
        return post;
    }

    async updatePost(userId: number, postId: number, data: Partial<CreatePostDto>) {
        const post = await this.getPost(userId, postId);

        if (post.status !== 'scheduled') {
            throw new BadRequestException('Can only update scheduled posts');
        }

        return this.prisma.scheduledPost.update({
            where: { id: postId },
            data: {
                ...data,
                scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
            },
        });
    }

    async cancelPost(userId: number, postId: number) {
        const post = await this.getPost(userId, postId);

        if (post.status !== 'scheduled') {
            throw new BadRequestException('Can only cancel scheduled posts');
        }

        return this.prisma.scheduledPost.update({
            where: { id: postId },
            data: { status: 'cancelled' },
        });
    }

    async deletePost(userId: number, postId: number) {
        await this.getPost(userId, postId);
        await this.prisma.scheduledPost.delete({ where: { id: postId } });
        return { success: true };
    }

    async generateCaption(data: GenerateCaptionDto) {
        const openaiKey = this.configService.get<string>('OPENAI_API_KEY');

        if (openaiKey) {
            try {
                return await this.generateWithOpenAI(data, openaiKey);
            } catch (error) {
                console.error('OpenAI caption generation failed:', error);
                throw new BadRequestException('AI caption generation failed. Please try again.');
            }
        }

        throw new BadRequestException(
            'AI caption generation requires OPENAI_API_KEY to be configured in environment variables.',
        );
    }

    private async generateWithOpenAI(data: GenerateCaptionDto, apiKey: string) {
        const prompt = `Generate a ${data.tone} social media caption for ${data.platform} about: ${data.topic}

Requirements:
- Tone: ${data.tone}
- Platform: ${data.platform}
${data.includeEmojis ? '- Include relevant emojis' : '- Do NOT include emojis'}
${data.includeHashtags ? '- Include 4-6 relevant hashtags at the end' : '- Do NOT include hashtags'}
- Keep it concise and engaging
- Match the platform's typical style (${this.getPlatformStyle(data.platform)})

Respond with ONLY the caption text, nothing else.`;

        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a social media marketing expert who creates viral, engaging captions.',
                    },
                    { role: 'user', content: prompt },
                ],
                temperature: 0.8,
                max_tokens: 300,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${apiKey}`,
                },
            },
        );

        const caption = response.data.choices[0]?.message?.content?.trim() || '';
        const hashtagMatch = caption.match(/#\w+/g) || [];

        return {
            caption,
            suggestedHashtags: hashtagMatch,
            bestTimeToPost: this.getBestPostingTime(data.platform),
        };
    }

    private getPlatformStyle(platform: string): string {
        const styles: Record<string, string> = {
            instagram: 'visual storytelling, lifestyle focus, 2200 char limit',
            tiktok: 'trendy, casual, Gen-Z friendly, short and punchy',
            twitter: 'concise, witty, under 280 chars, conversational',
            facebook: 'community-focused, can be longer, shareable',
        };
        return styles[platform] || 'engaging and authentic';
    }

    async getCalendarView(userId: number, month: number, year: number) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        const posts = await this.prisma.scheduledPost.findMany({
            where: {
                userId,
                scheduledAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            orderBy: { scheduledAt: 'asc' },
        });

        const calendar: Record<string, any[]> = {};
        posts.forEach((post) => {
            const day = post.scheduledAt.getDate().toString();
            if (!calendar[day]) calendar[day] = [];
            calendar[day].push(post);
        });

        return calendar;
    }

    @Cron(CronExpression.EVERY_MINUTE)
    async processScheduledPosts() {
        const now = new Date();
        const posts = await this.prisma.scheduledPost.findMany({
            where: {
                status: 'scheduled',
                scheduledAt: { lte: now },
            },
        });

        for (const post of posts) {
            try {
                await this.publishPost(post);

                await this.prisma.scheduledPost.update({
                    where: { id: post.id },
                    data: {
                        status: 'published',
                        publishedAt: new Date(),
                    },
                });

                if (post.autoBoost && post.boostServiceId && post.boostQuantity) {
                    await this.triggerAutoBoost(post);
                }
            } catch (error) {
                await this.prisma.scheduledPost.update({
                    where: { id: post.id },
                    data: {
                        status: 'failed',
                        errorMessage: error.message,
                    },
                });
            }
        }
    }

    private async publishPost(post: any) {
        // Note: Real publishing requires OAuth integration with each platform
        // - Instagram: Facebook Graph API with Business Account
        // - TikTok: TikTok Content Posting API
        // - Twitter: Twitter API v2
        // Each requires separate OAuth app registration and user authorization
        console.log(`[Scheduler] Publishing post ${post.id} to ${post.platform}`);
        return true;
    }

    private async triggerAutoBoost(post: any) {
        try {
            const user = await this.prisma.user.findUnique({ where: { id: post.userId } });
            if (!user) return;

            const service = await this.prisma.service.findUnique({
                where: { id: post.boostServiceId },
            });
            if (!service) return;

            const charge = (service.rate * post.boostQuantity) / 1000;

            if (user.balance >= charge) {
                await this.prisma.order.create({
                    data: {
                        userId: post.userId,
                        serviceId: post.boostServiceId,
                        link: `https://${post.platform}.com/p/${post.id}`,
                        quantity: post.boostQuantity,
                        charge,
                        status: 'Pending',
                    },
                });

                await this.prisma.user.update({
                    where: { id: post.userId },
                    data: {
                        balance: { decrement: charge },
                        totalSpent: { increment: charge },
                    },
                });

                console.log(`[Scheduler] Auto-boost order created for post ${post.id}`);
            }
        } catch (error) {
            console.error(`[Scheduler] Auto-boost failed for post ${post.id}:`, error);
        }
    }

    private getBestPostingTime(platform: string): string {
        const times: Record<string, string> = {
            instagram: '11:00 AM - 1:00 PM, 7:00 PM - 9:00 PM',
            tiktok: '7:00 PM - 11:00 PM',
            twitter: '8:00 AM - 10:00 AM, 12:00 PM - 1:00 PM',
            facebook: '1:00 PM - 4:00 PM',
        };
        return times[platform] || '9:00 AM - 5:00 PM';
    }
}
