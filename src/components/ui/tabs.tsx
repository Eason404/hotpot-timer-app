import * as React from "react"

import { cn } from "@/lib/utils"

type TabsContextValue = {
  value: string
  setValue: (value: string) => void
  idPrefix: string
  orientation: "horizontal" | "vertical"
}

const TabsContext = React.createContext<TabsContextValue | null>(null)

function useTabsContext(component: string): TabsContextValue {
  const ctx = React.useContext(TabsContext)
  if (!ctx) {
    throw new Error(`${component} must be used within <Tabs>.`)
  }
  return ctx
}

type TabsProps = React.PropsWithChildren<{
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  className?: string
  orientation?: "horizontal" | "vertical"
}>

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  { value, defaultValue, onValueChange, className, orientation = "horizontal", children, ...props },
  ref,
) {
  const isControlled = value !== undefined
  const [internalValue, setInternalValue] = React.useState(() => defaultValue ?? "")
  const currentValue = isControlled ? value! : internalValue
  const baseId = React.useId()

  const setValue = React.useCallback(
    (next: string) => {
      if (!isControlled) {
        setInternalValue(next)
      }
      onValueChange?.(next)
    },
    [isControlled, onValueChange],
  )

  const ctx = React.useMemo<TabsContextValue>(
    () => ({ value: currentValue, setValue, idPrefix: baseId, orientation }),
    [currentValue, setValue, baseId, orientation],
  )

  return (
    <TabsContext.Provider value={ctx}>
      <div
        ref={ref}
        className={cn(
          "flex flex-col",
          orientation === "vertical" && "md:flex-row",
          className,
        )}
        data-orientation={orientation}
        {...props}
      >
        {children}
      </div>
    </TabsContext.Provider>
  )
})

Tabs.displayName = "Tabs"

type TabsListProps = React.ComponentPropsWithoutRef<"div">

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(function TabsList(
  { className, children, ...props },
  ref,
) {
  const { value, orientation } = useTabsContext("TabsList")
  return (
    <div
      ref={ref}
      role="tablist"
      aria-orientation={orientation}
      className={cn(
        "inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
        className,
      )}
      data-state={value ? "active" : "inactive"}
      {...props}
    >
      {children}
    </div>
  )
})

TabsList.displayName = "TabsList"

type TabsTriggerProps = React.ComponentPropsWithoutRef<"button"> & {
  value: string
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(function TabsTrigger(
  { className, value, disabled, ...props },
  ref,
) {
  const { value: activeValue, setValue, idPrefix } = useTabsContext("TabsTrigger")
  const triggerId = `${idPrefix}-trigger-${value}`
  const contentId = `${idPrefix}-content-${value}`
  const isActive = activeValue === value

  return (
    <button
      ref={ref}
      id={triggerId}
      role="tab"
      type="button"
      data-state={isActive ? "active" : "inactive"}
      aria-selected={isActive}
      aria-controls={contentId}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow",
        className,
      )}
      onClick={() => {
        if (!disabled) {
          setValue(value)
        }
      }}
      {...props}
    />
  )
})

TabsTrigger.displayName = "TabsTrigger"

type TabsContentProps = React.ComponentPropsWithoutRef<"div"> & {
  value: string
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(function TabsContent(
  { className, value, children, ...props },
  ref,
) {
  const { value: activeValue, idPrefix } = useTabsContext("TabsContent")
  const triggerId = `${idPrefix}-trigger-${value}`
  const contentId = `${idPrefix}-content-${value}`
  const isActive = activeValue === value

  return (
    <div
      ref={ref}
      role="tabpanel"
      id={contentId}
      aria-labelledby={triggerId}
      data-state={isActive ? "active" : "inactive"}
      hidden={!isActive}
      className={cn(
        "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className,
      )}
      {...props}
    >
      {isActive ? children : null}
    </div>
  )
})

TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }
