import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TicketsService {
    constructor(private prisma: PrismaService) { }

    async createTicket(userId: number, subject: string, message: string, priority: string = 'Normal') {
        return (this.prisma as any).ticket.create({
            data: {
                userId,
                subject,
                priority,
                messages: {
                    create: {
                        message,
                        isAdmin: false
                    }
                }
            },
            include: { messages: true }
        });
    }

    async getUserTickets(userId: number) {
        return (this.prisma as any).ticket.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' },
            include: {
                _count: { select: { messages: true } }
            }
        });
    }

    async getTicket(userId: number, ticketId: number) {
        const ticket = await (this.prisma as any).ticket.findUnique({
            where: { id: ticketId },
            include: { messages: { orderBy: { createdAt: 'asc' } } }
        });

        if (!ticket) throw new NotFoundException('Ticket not found');
        if (ticket.userId !== userId) throw new ForbiddenException('Access denied');

        return ticket;
    }

    async replyToTicket(userId: number, ticketId: number, message: string) {
        // Verify ownership
        await this.getTicket(userId, ticketId);

        return this.prisma.$transaction([
            (this.prisma as any).ticketMessage.create({
                data: {
                    ticketId,
                    message,
                    isAdmin: false
                }
            }),
            (this.prisma as any).ticket.update({
                where: { id: ticketId },
                data: { status: 'Open', updatedAt: new Date() } // Re-open if replied
            })
        ]);
    }

    // --- Admin Methods ---

    async getAllTickets() {
        return (this.prisma as any).ticket.findMany({
            orderBy: { updatedAt: 'desc' },
            include: {
                user: { select: { email: true, name: true } },
                _count: { select: { messages: true } }
            }
        });
    }

    async getTicketAdmin(ticketId: number) {
        return (this.prisma as any).ticket.findUnique({
            where: { id: ticketId },
            include: {
                messages: { orderBy: { createdAt: 'asc' } },
                user: { select: { email: true, name: true } }
            }
        });
    }

    async adminReply(ticketId: number, message: string, status: string = 'Answered') {
        return this.prisma.$transaction([
            (this.prisma as any).ticketMessage.create({
                data: {
                    ticketId,
                    message,
                    isAdmin: true
                }
            }),
            (this.prisma as any).ticket.update({
                where: { id: ticketId },
                data: { status, updatedAt: new Date() }
            })
        ]);
    }
}
