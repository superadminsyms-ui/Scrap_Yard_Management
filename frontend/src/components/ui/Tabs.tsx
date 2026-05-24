import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface TabsProps {
  tabs: { key: string; label: string }[]
  activeTab: string
  onTabChange: (key: string) => void
  children: ReactNode
}

export function Tabs({ tabs, activeTab, onTabChange, children }: TabsProps) {
  return (
    <div>
      <div className="border-b border-outline">
        <nav className="flex gap-0 -mb-px">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={cn(
                'relative px-5 pb-3 pt-1 text-label-lg transition-colors cursor-pointer',
                activeTab === tab.key
                  ? 'text-primary-500'
                  : 'text-secondary-500 hover:text-secondary-700',
              )}
            >
              {tab.label}
              {activeTab === tab.key && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 rounded-full" />
              )}
            </button>
          ))}
        </nav>
      </div>
      <div className="mt-6">{children}</div>
    </div>
  )
}
