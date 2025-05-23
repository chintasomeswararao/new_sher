// 'use client';

// import Link from 'next/link';
// import { useRouter } from 'next/navigation';
// import { useActionState, useEffect, useState } from 'react';
// import { toast } from 'sonner';

// import { AuthForm } from '@/components/auth-form';
// import { SubmitButton } from '@/components/submit-button';
// import { Button } from '@/components/ui/button';

// import { login, type LoginActionState } from '../actions';

// export default function Page() {
//   const router = useRouter();

//   const [email, setEmail] = useState('');
//   const [isSuccessful, setIsSuccessful] = useState(false);

//   const [state, formAction] = useActionState<LoginActionState, FormData>(
//     login,
//     {
//       status: 'idle',
//     },
//   );

//   useEffect(() => {
//     if (!state) return;
    
//     if (state.status === 'failed') {
//       setIsSuccessful(false);
//       toast.error('Invalid credentials!');
//     } else if (state.status === 'invalid_data') {
//       setIsSuccessful(false);
//       toast.error('Failed validating your submission!');
//     } else if (state.status === 'success') {
//       setIsSuccessful(true);
//       toast.success('Login successful! Redirecting...');
      
//       // Wait a moment for the success animation and toast to be visible
//       setTimeout(() => {
//         // Force a hard navigation to ensure fresh state
//         window.location.href = '/';
//       }, 1000);
//     }
//   }, [state, router]);

//   const handleSubmit = (formData: FormData) => {
//     setEmail(formData.get('email') as string);
//     // Show loading state
//     setIsSuccessful(false);
//     formAction(formData);
//   };

//   // const handleAnonymousLogin = async () => {
//   //   try {
//   //     await signIn('credentials', {
//   //       redirect: false,
//   //     });
//   //     router.refresh();
//   //   } catch (error) {
//   //     toast.error('Failed to continue as guest');
//   //   }
//   // };

//   return (
//     <div className="flex h-dvh w-screen items-start pt-12 md:pt-0 md:items-center justify-center bg-background">
//       <div className="w-full max-w-md overflow-hidden rounded-2xl flex flex-col gap-12">
//         <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
//           <h3 className="text-xl font-semibold dark:text-zinc-50">Sign In</h3>
//           <p className="text-sm text-gray-500 dark:text-zinc-400">
//             Use your email and password to sign in
//           </p>
//         </div>
//         <AuthForm action={handleSubmit} defaultEmail={email}>
//           <SubmitButton isSuccessful={isSuccessful}>Sign in</SubmitButton>
//           <div className="flex flex-col gap-4 mt-4">
//             <div className="relative">
//               <div className="absolute inset-0 flex items-center">
//                 <span className="w-full border-t" />
//               </div>
//               {/* <div className="relative flex justify-center text-xs uppercase">
//                 <span className="bg-background px-2 text-muted-foreground">
//                   Or
//                 </span>
//               </div> */}
//             </div>
//             {/* <Button
//               variant="outline"
//               onClick={handleAnonymousLogin}
//               type="button"
//             >
//               Continue as Guest
//             </Button> */}
//           </div>
//           {/* <p className="text-center text-sm text-gray-600 mt-4 dark:text-zinc-400">
//             {"Don't have an account? "}
//             <Link
//               href="/register"
//               className="font-semibold text-gray-800 hover:underline dark:text-zinc-200"
//             >
//               Sign up
//             </Link>
//             {' for free.'}
//           </p> */}
//         </AuthForm>
//       </div>
//     </div>
//   );
// }


// app/login/page.tsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { AuthForm } from '@/components/auth-form';
import { SubmitButton } from '@/components/submit-button';
import { Button } from '@/components/ui/button';

import { login, type LoginActionState } from '../actions';

export default function Page() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [isSuccessful, setIsSuccessful] = useState(false);

  const [state, formAction] = useActionState<LoginActionState, FormData>(
    login,
    {
      status: 'idle',
    },
  );

  useEffect(() => {
    if (!state) return;
    
    if (state.status === 'failed') {
      setIsSuccessful(false);
      toast.error(state.message || 'Invalid credentials!');
    } else if (state.status === 'invalid_data') {
      setIsSuccessful(false);
      toast.error(state.message || 'Failed validating your submission!');
    } else if (state.status === 'success') {
      setIsSuccessful(true);
      toast.success('Login successful! Redirecting...');
      
      // Sync user data with backend
      syncUserData();
      
      // Wait a moment for the success animation and toast to be visible
      setTimeout(() => {
        // Force a hard navigation to ensure fresh state
        window.location.href = '/';
      }, 1000);
    }
  }, [state]);
  
  const syncUserData = async () => {
    try {
      const response = await fetch('/api/sync-user');
      if (!response.ok) {
        console.error('Failed to sync user data:', await response.text());
      } else {
        console.log('User data synced successfully');
      }
    } catch (error) {
      console.error('Error syncing user data:', error);
      // Non-blocking - we continue even if sync fails
    }
  };

  const handleSubmit = (formData: FormData) => {
    setEmail(formData.get('email') as string);
    // Show loading state
    setIsSuccessful(false);
    formAction(formData);
  };

  return (
    <div className="flex h-dvh w-screen items-start pt-12 md:pt-0 md:items-center justify-center bg-background">
      <div className="w-full max-w-md overflow-hidden rounded-2xl flex flex-col gap-12">
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <h3 className="text-xl font-semibold dark:text-zinc-50">Sign In</h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Use your email and password to sign in
          </p>
        </div>
        <AuthForm action={handleSubmit} defaultEmail={email}>
          <SubmitButton isSuccessful={isSuccessful}>Sign in</SubmitButton>
          <div className="flex flex-col gap-4 mt-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
            </div>
          </div>
        </AuthForm>
      </div>
    </div>
  );
}