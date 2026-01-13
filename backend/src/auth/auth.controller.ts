import { Controller, Request, Post, UseGuards, Get, Body, Res, Param, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service'; // Import
import { CreateUserDto } from '../users/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService // Inject
  ) { }

  @UseGuards(AuthGuard('local'))
  @Post('login')
  @Post('login')
  async login(@Request() req: { user: any }) {
    return this.authService.login(req.user);
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  async getProfile(@Request() req: { user: { userId?: number; id?: number } }) {
    // req.user has { userId, ... } from JwtStrategy, or { id, ... } depending on implementation.
    // Let's check JwtStrategy. Usually it maps 'sub' -> 'userId'.
    // If local.strategy, it returns full user.
    // Assuming jwt strategy is active here.
    const userId = req.user.userId || req.user.id;
    if (!userId) throw new ForbiddenException('Invalid token payload');
    return this.usersService.findOne(userId);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Request() req: any) {
    // Initiates the Google OAuth flow
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Request() req: any, @Res() res: any) {
    const result = await this.authService.login(req.user);
    // In production, use environment variable for frontend URL
    res.redirect(`http://localhost:3000/login?token=${result.access_token}`);
  }

  @Post('impersonate/:id')
  @UseGuards(AuthGuard('jwt'))
  async impersonate(@Request() req: { user: { role: string } }, @Param('id') id: string) {
    if (req.user.role !== 'admin') throw new ForbiddenException('Admin Only');
    return this.authService.impersonate(+id);
  }
}
