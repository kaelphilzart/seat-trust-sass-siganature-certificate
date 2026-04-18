'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import { usePathname } from 'next/navigation'
import SidebarContent, { filterByRole, normalizeRole } from './Sidebaritems'
import SimpleBar from 'simplebar-react'
import { Icon } from '@iconify/react'
import {
  AMLogo,
  AMMenu,
  AMMenuItem,
  AMSidebar,
  AMSubmenu,
} from 'tailwind-sidebar'
import 'tailwind-sidebar/styles.css'

import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from 'next-auth/react'

/* ================= ACTIVE CHECK ================= */
const isActivePath = (currentPath: string, url?: string) => {
  if (!url) return false

  // 🔥 handle root "/"
  if (url === '/') return currentPath === '/'

  // 🔥 exact OR nested
  return currentPath === url || currentPath.startsWith(url + '/')
}

/* ================= RENDER ITEMS ================= */
const renderSidebarItems = (
  items: any[],
  currentPath: string,
  onClose?: () => void,
  isSubItem: boolean = false
) => {
  return items.map((item, index) => {
    const isSelected = isActivePath(currentPath, item?.url)
    const IconComp = item.icon || null

    const iconElement = IconComp ? (
      <Icon icon={IconComp} height={21} width={21} />
    ) : (
      <Icon icon={'ri:checkbox-blank-circle-line'} height={9} width={9} />
    )

    /* ===== HEADING ===== */
    if (item.heading) {
      return (
        <div className='mb-1' key={item.heading}>
          <AMMenu
            subHeading={item.heading}
            ClassName='hide-menu leading-21 text-charcoal font-bold uppercase text-xs dark:text-darkcharcoal'
          />
        </div>
      )
    }

    /* ===== SUBMENU ===== */
    if (item.children?.length) {
      return (
        <AMSubmenu
          key={item.id}
          icon={iconElement}
          title={item.name}
          ClassName='mt-1.5 text-link dark:text-darklink'
        >
          <AnimatePresence>
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
              {renderSidebarItems(item.children, currentPath, onClose, true)}
            </motion.div>
          </AnimatePresence>
        </AMSubmenu>
      )
    }

    /* ===== ITEM ===== */
    const linkTarget = item.url?.startsWith('https') ? '_blank' : '_self'

    const itemClassNames = isSubItem
      ? `mt-1.5 text-link dark:text-darklink ${
          isSelected ? '!bg-transparent !text-primary' : ''
        } !px-1.5`
      : `hover:bg-lightprimary! hover:text-primary! mt-1.5 text-link dark:text-darklink ${
          isSelected
            ? '!bg-lightprimary !text-primary !hover-bg-lightprimary'
            : ''
        }`

    return (
      <div onClick={onClose} key={index}>
        <AMMenuItem
          key={item.id}
          icon={iconElement}
          isSelected={isSelected}
          link={item.url || undefined}
          target={linkTarget}
          component={Link}
          className={itemClassNames}
        >
          <span className='truncate flex-1'>
            {item.title || item.name}
          </span>
        </AMMenuItem>
      </div>
    )
  })
}

/* ================= SIDEBAR ================= */
const SidebarLayout = ({ onClose }: { onClose?: () => void }) => {
  const pathname = usePathname()
  const { theme } = useTheme()
  const { data: session } = useSession()

  const role = normalizeRole(session?.user?.role)

  const sidebarMode =
    theme === 'light' || theme === 'dark' ? theme : undefined

  return (
    <AMSidebar
      collapsible='none'
      animation
      showProfile={false}
      width='16rem'
      showTrigger={false}
      mode={sidebarMode}
      className='fixed left-0 top-0 border-none bg-background z-10 h-screen'
    >
      {/* LOGO */}
      <div className='px-4 flex items-center brand-logo overflow-hidden'>
        <AMLogo component={Link} href='/' img=''>
          <Image
            src='/images/logos/seal-trust-logo.png'
            alt='logo'
            width={135}
            height={40}
            className='rtl:scale-x-[-1]'
          />
        </AMLogo>
      </div>

      {/* MENU */}
      <SimpleBar className='h-[calc(100vh-10vh)]'>
        <div className='px-6'>
          {SidebarContent.map((section, index) => {
            const filteredItems = filterByRole(
              section.children || [],
              role
            )

            if (!filteredItems.length) return null

            return (
              <div key={index}>
                {renderSidebarItems(
                  [
                    ...(section.heading
                      ? [{ heading: section.heading }]
                      : []),
                    ...filteredItems,
                  ],
                  pathname,
                  onClose
                )}
              </div>
            )
          })}
        </div>
      </SimpleBar>
    </AMSidebar>
  )
}

export default SidebarLayout