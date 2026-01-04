import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
    private mailService: MailService,
  ) { }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        balance: user.balance
      }
    };
  }

  async register(data: CreateUserDto & { referralCode?: string }) {
    this.logger.log(`Attempting to register user: ${data.email}`);

    // 1. Check if user exists
    const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      this.logger.warn(`Registration failed: Email ${data.email} already exists ID: ${existing.id}`);
      throw new BadRequestException('Email already currently in use');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    let referrerId = null;
    if (data.referralCode) {
      const referrer = await this.prisma.user.findUnique({ where: { referralCode: data.referralCode } });
      if (referrer) referrerId = referrer.id;
    }

    const myReferralCode = Math.random().toString(36).substring(2, 10).toUpperCase();

    const newUser = await this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
        referralCode: myReferralCode,
        referredById: referrerId,
      },
    });

    // 2. Send Welcome Email
    this.mailService.sendWelcome(newUser.email);

    // 3. Auto-Login
    return this.login(newUser);
  }

  async validateOAuthUser(profile: { email: string, name: string, picture: string, accessToken: string }) {
    const user = await this.prisma.user.findUnique({ where: { email: profile.email } });

    if (user) {
      // User exists, just return them
      const { password, ...result } = user;
      return result;
    }

    // New user -> Register them automatically
    // We generate a random password since they use Google
    const randomPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(randomPassword, 10);
    const myReferralCode = Math.random().toString(36).substring(2, 10).toUpperCase();

    const newUser = await this.prisma.user.create({
      data: {
        email: profile.email,
        name: profile.name,
        password: hashedPassword,
        referralCode: myReferralCode,
        role: 'user',
        balance: 0
      }
    });

    this.mailService.sendWelcome(newUser.email);

    const { password, ...result } = newUser;
    return result;
  }

  async impersonate(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');
    return this.login(user);
  }
}
