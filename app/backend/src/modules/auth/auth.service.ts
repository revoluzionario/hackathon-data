import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
	constructor(
		private readonly usersService: UsersService,
		private readonly jwtService: JwtService,
	) {}

	async register(dto: RegisterDto) {
		const existingUser = await this.usersService.findByEmail(dto.email);
		if (existingUser) {
			throw new BadRequestException('Email is already registered');
		}

		const passwordHash = await bcrypt.hash(dto.password, 10);
		const user = await this.usersService.create({
			email: dto.email,
			name: dto.name,
			passwordHash,
		});

		return this.signToken(user);
	}

	async login(dto: LoginDto) {
		const user = await this.usersService.findByEmail(dto.email);
		if (!user) {
			throw new UnauthorizedException('Invalid credentials');
		}

		const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
		if (!isPasswordValid) {
			throw new UnauthorizedException('Invalid credentials');
		}

		return this.signToken(user);
	}

	async signToken(user: User) {
		const payload = {
			sub: user.id,
			email: user.email,
		};
		const accessToken = await this.jwtService.signAsync(payload);

		return { access_token: accessToken };
	}
}
