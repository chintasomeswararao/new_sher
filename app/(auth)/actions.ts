'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';

import { auth, signIn } from '@/app/(auth)/auth';

const authFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type LoginActionState = {
  status: 'idle' | 'in_progress' | 'success' | 'failed' | 'invalid_data';
  message?: string;
};

export type RegisterActionState = {
  status: 'idle' | 'in_progress' | 'success' | 'failed' | 'invalid_data';
  message?: string;
};

export async function register(
  state: RegisterActionState,
  formData: FormData
): Promise<RegisterActionState> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { status: 'invalid_data', message: 'Email and password are required' };
  }

  try {
    // Since we're not using a database, we'll just redirect to login
    return redirect('/login');
  } catch (error) {
    return { status: 'failed', message: 'Failed to register' };
  }
}

export async function login(
  state: LoginActionState,
  formData: FormData
): Promise<LoginActionState> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { status: 'invalid_data', message: 'Email and password are required' };
  }

  try {
    // Validate the form data against the schema
    const result = authFormSchema.safeParse({ email, password });
    if (!result.success) {
      return { status: 'invalid_data', message: 'Invalid email or password format' };
    }

    // Attempt to sign in with the provided credentials
    const session = await signIn('credentials', {
      email,
      password,
      redirect: false
    });

    if (!session) {
      return { status: 'failed', message: 'Invalid credentials' };
    }

    // Return success state instead of redirecting
    return { status: 'success', message: 'Login successful' };
  } catch (error) {
    console.error('Login error:', error);
    return { status: 'failed', message: 'Failed to login' };
  }
}
