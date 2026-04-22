'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Icon } from '@iconify/react';
import Profile from './Profile';
import Notifications from './Notifications';
import SidebarLayout from '../sidebar/Sidebar';
import FullLogo from '../shared/logo/FullLogo';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

const Header = () => {
  const { theme, setTheme } = useTheme();
  const [isSticky, setIsSticky] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleMode = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <>
      <header
        className={`sticky top-0 z-2 ${
          isSticky ? 'bg-background shadow-md fixed w-full' : 'bg-transparent'
        }`}
      >
        <nav
          className={`rounded-none  py-4 sm:ps-6 max-w-full! sm:pe-10 dark:bg-dark flex justify-between items-center px-6`}
        >
          {/* Mobile Toggle Icon */}
          <div
            onClick={() => {
              setIsOpen(true);
            }}
            className="px-3.5 hover:text-primary dark:hover:text-primary text-link dark:text-darklink relative after:absolute after:w-10 after:h-10 after:rounded-full hover:after:bg-lightprimary  after:bg-transparent rounded-full xl:hidden flex justify-center items-center cursor-pointer"
          >
            <Icon icon="tabler:menu-2" height={20} width={20} />
          </div>

          <div className="block xl:hidden">
            <FullLogo />
          </div>

          <div className="flex xl:hidden items-center">
            <div
              className="hover:text-primary px-2 md:px-15 group focus:ring-0 rounded-full flex justify-center items-center cursor-pointer text-gray relative"
              onClick={toggleMode}
            >
              <span className="flex items-center justify-center relative after:absolute after:w-10 after:h-10 after:rounded-full after:-top-1/2   group-hover:after:bg-lightprimary">
                {theme === 'light' ? (
                  <Icon icon="tabler:moon" width="20" />
                ) : (
                  <Icon
                    icon="solar:sun-bold-duotone"
                    width="20"
                    className="group-hover:text-primary"
                  />
                )}
              </span>
            </div>

            <div className="xl:block ">
              <div className="flex gap-0 items-center relative">
                {/* Chat */}
                <Notifications />
              </div>
            </div>

            {/* Profile Dropdown */}
            <Profile />
          </div>

          <div className="hidden xl:flex items-center justify-between w-full">
            <div className="flex w-full justify-end items-end">
              <div className="flex gap-0 items-center ">
                {/* ✅ Dark/Light Toggle */}
                <div
                  className="hover:text-primary px-15 group focus:ring-0 rounded-full flex justify-center items-center cursor-pointer text-gray relative"
                  onClick={toggleMode}
                >
                  <span className="flex items-center justify-center relative after:absolute after:w-10 after:h-10 after:rounded-full after:-top-1/2   group-hover:after:bg-lightprimary">
                    {theme === 'light' ? (
                      <Icon icon="tabler:moon" width="20" />
                    ) : (
                      <Icon
                        icon="solar:sun-bold-duotone"
                        width="20"
                        className="group-hover:text-primary"
                      />
                    )}
                  </span>
                </div>

                <div className="xl:block ">
                  <div className="flex gap-0 items-center relative">
                    {/* Chat */}
                    <Notifications />
                  </div>
                </div>

                {/* Profile Dropdown */}
                <Profile />
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Sidebar */}
      <div className="lg:hidden">
        {/* Overlay */}
        <div
          id="mobile-overlay"
          className={`fixed inset-0 bg-black/50 z-30 transition-opacity duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
          onClick={() => setIsOpen(false)}
        />

        {/* Sidebar */}
        <div
          id="mobile-sidebar"
          className={`fixed inset-y-0 left-0 z-40 w-64 bg-background shadow-lg transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <VisuallyHidden>
            <span>Sidebar</span>
          </VisuallyHidden>
          <SidebarLayout onClose={() => setIsOpen(false)} />
        </div>
      </div>
    </>
  );
};

export default Header;
