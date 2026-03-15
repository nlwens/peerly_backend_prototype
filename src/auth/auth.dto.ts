// src/auth/dto/auth.dto.ts

export class RegisterDto {
    email!: string;
    password!: string;
    name!: string;
    // 如果前端注册时还会传 major 或 education_level，也可以加在这里
    // major?: string;
}
  
export class LoginDto {
    email!: string;
    password!: string;
}