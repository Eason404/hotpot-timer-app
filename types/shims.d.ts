import type * as React from "react";

declare module "@radix-ui/react-tabs" {
  export interface TabsRootProps extends React.ComponentPropsWithoutRef<"div"> {
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    orientation?: "horizontal" | "vertical";
  }

  export interface TabsTriggerProps extends React.ComponentPropsWithoutRef<"button"> {
    value: string;
  }

  export interface TabsContentProps extends React.ComponentPropsWithoutRef<"div"> {
    value: string;
  }

  export const Root: React.ForwardRefExoticComponent<
    TabsRootProps & React.RefAttributes<HTMLDivElement>
  >;
  export const List: React.ForwardRefExoticComponent<
    React.ComponentPropsWithoutRef<"div"> & React.RefAttributes<HTMLDivElement>
  >;
  export const Trigger: React.ForwardRefExoticComponent<
    TabsTriggerProps & React.RefAttributes<HTMLButtonElement>
  >;
  export const Content: React.ForwardRefExoticComponent<
    TabsContentProps & React.RefAttributes<HTMLDivElement>
  >;
}
