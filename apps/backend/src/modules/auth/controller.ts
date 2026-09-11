import type { Request, Response } from 'express';
import { registerUser, loginUser, refreshTokens, getUserById, type AuthTokens } from './service';
import type { RegisterInput, LoginInput } from './schemas';

function setRefreshTokenCookie(res: Response, refreshToken: string) {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/auth/refresh',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

function clearRefreshTokenCookie(res: Response) {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/auth/refresh',
  });
}

export async function registerController(req: Request, res: Response) {
  const data = req.body as RegisterInput;
  const result = await registerUser(data);
  
  setRefreshTokenCookie(res, result.tokens.refreshToken);
  
  res.status(201).json({
    success: true,
    data: {
      user: result.user,
      accessToken: result.tokens.accessToken,
    },
  });
}

export async function loginController(req: Request, res: Response) {
  const data = req.body as LoginInput;
  const result = await loginUser(data.email, data.password);
  
  setRefreshTokenCookie(res, result.tokens.refreshToken);
  
  res.json({
    success: true,
    data: {
      user: result.user,
      accessToken: result.tokens.accessToken,
    },
  });
}

export async function refreshController(req: Request, res: Response) {
  const refreshToken = req.cookies?.refreshToken;
  
  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Refresh token required' },
    });
  }

  const tokens = await refreshTokens(refreshToken);
  setRefreshTokenCookie(res, tokens.refreshToken);
  
  res.json({
    success: true,
    data: { accessToken: tokens.accessToken },
  });
}

export async function logoutController(req: Request, res: Response) {
  clearRefreshTokenCookie(res);
  
  res.json({
    success: true,
    data: { message: 'Logged out successfully' },
  });
}

export async function meController(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
    });
  }

  const user = await getUserById(req.user.userId);
  
  res.json({
    success: true,
    data: { user },
  });
}