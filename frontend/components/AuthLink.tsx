'use client';

import { useRouter } from 'next/navigation';

interface AuthLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export default function AuthLink({ href, children, className }: AuthLinkProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (href === '/dashboard') {
      // Vérifier si l'utilisateur est connecté
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      if (token && user) {
        router.push('/dashboard');
      } else {
        router.push('/auth/login');
      }
    } else {
      router.push(href);
    }
  };

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
