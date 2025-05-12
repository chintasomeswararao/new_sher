'use client';

import type { User } from 'next-auth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import inpharmdLogo from '../public/images/inpharmd.png';
import { useEffect, useState } from 'react';

import { PlusIcon } from '@/components/icons';
import { SidebarHistory } from '@/components/sidebar-history';
import { SidebarUserNav } from '@/components/sidebar-user-nav';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  useSidebar,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { PanelLeft } from 'lucide-react';

export function AppSidebar({ user }: { user: User | undefined }) {
  const router = useRouter();
  const { setOpenMobile, toggleSidebar, state } = useSidebar();
  const [isMounted, setIsMounted] = useState(false);
  
  // Use useEffect to handle client-side rendering
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Debug values
  const logoSrc = "/images/inpharmd.png";

  return (
    <Sidebar className="group-data-[side=left]:border-r-0">
      <SidebarHeader>
        <SidebarMenu>
          <div className="flex flex-row justify-between items-center">
            <div className="flex flex-col items-start px-2">
              <Link
                href="/"
                onClick={() => {
                  setOpenMobile(false);
                }}
                className="flex flex-row gap-3 items-center"
              >
                {state === 'collapsed' ? (
                  <div className="h-8 w-8 relative">
                    <Image 
                      src={logoSrc}
                      alt="InpharmD Logo"
                      fill
                      sizes="32px"
                      priority
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="h-8 w-24 relative">
                    <Image 
                      src={logoSrc}
                      alt="InpharmD Logo"
                      fill
                      sizes="96px"
                      priority
                      className="object-contain"
                    />
                  </div>
                )}
              </Link>
              {isMounted && state !== 'collapsed' && (
                <Link
                  href="https://firecrawl.dev/"
                  onClick={() => {
                    setOpenMobile(false);
                  }}
                  className="flex flex-row gap-3 items-center"
                >
                  {/* <span className="text-sm text-muted-foreground leading-3">
                    by Firecrawl 🔥
                  </span> */}
                </Link>
              )}
            </div>
            <div className="flex gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    type="button"
                    className="p-2 h-fit"
                    onClick={toggleSidebar}
                  >
                    <PanelLeft />
                  </Button>
                </TooltipTrigger>
                <TooltipContent align="end">Toggle Sidebar</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    type="button"
                    className="p-2 h-fit"
                    onClick={() => {
                      setOpenMobile(false);
                      router.push('/');
                      router.refresh();
                    }}
                  >
                    <PlusIcon />
                  </Button>
                </TooltipTrigger>
                <TooltipContent align="end">New Query</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarHistory user={user} />
      </SidebarContent>
      <SidebarFooter>{user && <SidebarUserNav user={user} />}</SidebarFooter>
    </Sidebar>
  );
}