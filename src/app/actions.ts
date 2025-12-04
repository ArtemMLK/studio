
'use server';

import { redirect } from 'next/navigation';

export async function login(prevState: { error: string } | undefined, formData: FormData) {
  // This is a mock login function.
  // In a real application, you would:
  // 1. Validate the form data.
  // 2. Query your database for the user based on the provided login.
  // 3. Compare the provided password with the stored hashed password.
  // 4. If credentials are valid, create a session and set a cookie.
  // 5. If not, return an error message.
  
  const login = formData.get('login');
  const password = formData.get('password');

  // Basic validation
  if (!login || !password) {
    return { error: 'Логин и пароль обязательны.' };
  }

  // Mock validation: any login/password is accepted for this demo.
  // A real app would have secure logic here.
  // For example, checking for a blacklisted user.

  redirect('/dashboard');
}

export async function logout() {
  // In a real application, you would invalidate the user's session here.
  // This might involve clearing a session cookie or token.
  redirect('/');
}
