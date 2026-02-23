"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const prisma_service_1 = require("../prisma/prisma.service");
let AuthService = class AuthService {
    prisma;
    jwtService;
    otps = new Map();
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async register(dto) {
        const existing = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existing) {
            throw new common_1.ConflictException('Email already registered');
        }
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                password: hashedPassword,
                firstName: dto.firstName,
                lastName: dto.lastName,
                role: dto.role || 'PLAYER',
                phone: dto.phone,
            },
        });
        if (user.role === 'PLAYER') {
            const sportsId = `GS-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
            await this.prisma.player.create({
                data: {
                    userId: user.id,
                    sportsId,
                },
            });
        }
        const token = this.generateToken(user);
        return {
            user: this.sanitizeUser(user),
            accessToken: token,
        };
    }
    async login(dto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
            include: {
                player: {
                    include: { playerSports: { include: { sport: true } } }
                }
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isPasswordValid = await bcrypt.compare(dto.password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const token = this.generateToken(user);
        return {
            user: this.sanitizeUser(user),
            accessToken: token,
        };
    }
    async sendOtp({ phone }) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        this.otps.set(phone, otp);
        console.log(`\n======================================`);
        console.log(`💬 [DEV] SMS MOCK: OTP for ${phone} is ${otp}`);
        console.log(`======================================\n`);
        return { message: 'OTP sent successfully' };
    }
    async verifyOtp({ phone, otp }) {
        const storedOtp = this.otps.get(phone);
        if (!storedOtp || storedOtp !== otp) {
            throw new common_1.UnauthorizedException('Invalid or expired OTP');
        }
        this.otps.delete(phone);
        let user = await this.prisma.user.findFirst({
            where: { phone },
        });
        if (!user) {
            const dummyEmail = `${phone}_${Date.now()}@gamesphere.fan`;
            const dummyPassword = await bcrypt.hash(Math.random().toString(), 10);
            user = await this.prisma.user.create({
                data: {
                    email: dummyEmail,
                    password: dummyPassword,
                    firstName: 'Fan',
                    lastName: '',
                    phone: phone,
                    role: 'GENERAL_USER',
                },
            });
        }
        const token = this.generateToken(user);
        return {
            user: this.sanitizeUser(user),
            accessToken: token,
        };
    }
    async getProfile(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                player: {
                    include: { playerSports: { include: { sport: true } } }
                }
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        return this.sanitizeUser(user);
    }
    generateToken(user) {
        return this.jwtService.sign({
            sub: user.id,
            email: user.email,
            role: user.role,
        });
    }
    sanitizeUser(user) {
        const { password, ...result } = user;
        return result;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map