import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      position="bottom-right"
      closeButton
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4 text-[#2eff8c]" />,
        info: <InfoIcon className="size-4 text-[#01acff]" />,
        warning: <TriangleAlertIcon className="size-4 text-[#ffc832]" />,
        error: <OctagonXIcon className="size-4 text-[#ff6b6b]" />,
        loading: (
          <Loader2Icon className="size-4 animate-spin text-[#01acff]" />
        ),
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-[#1e2529] group-[.toaster]:text-white group-[.toaster]:border-[#37474f] group-[.toaster]:shadow-[0_8px_32px_rgba(0,0,0,0.4)] group-[.toaster]:rounded-xl",
          title: "group-[.toast]:text-white group-[.toast]:font-medium",
          description: "group-[.toast]:text-[#a0a8ad]",
          actionButton:
            "group-[.toast]:bg-[#2eff8c] group-[.toast]:text-black group-[.toast]:font-medium group-[.toast]:hover:bg-[#25cc70]",
          cancelButton:
            "group-[.toast]:bg-[#2a3237] group-[.toast]:text-[#c8cdd1] group-[.toast]:border-[#37474f] group-[.toast]:hover:bg-[#37474f]",
          closeButton:
            "group-[.toast]:text-[#798389] group-[.toast]:hover:text-white",
          success:
            "group-[.toast]:border-l-4 group-[.toast]:border-l-[#2eff8c]",
          error:
            "group-[.toast]:border-l-4 group-[.toast]:border-l-[#ff6b6b]",
          info:
            "group-[.toast]:border-l-4 group-[.toast]:border-l-[#01acff]",
          warning:
            "group-[.toast]:border-l-4 group-[.toast]:border-l-[#ffc832]",
        },
      }}
      style={
        {
          "--normal-bg": "#1e2529",
          "--normal-text": "#ffffff",
          "--normal-border": "#37474f",
          "--description-text": "#a0a8ad",
          "--border-radius": "0.75rem",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
