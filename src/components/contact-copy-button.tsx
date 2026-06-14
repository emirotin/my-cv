import { Check, Copy } from "lucide-react";
import type * as React from "react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { CONTACT_COPY_TEXT } from "@/lib/contact";

type ContactCopyButtonProps = Omit<
  React.ComponentProps<typeof Button>,
  "asChild" | "children" | "onClick" | "type"
>;

export function ContactCopyButton({ ...props }: ContactCopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<number | undefined>(undefined);

  useEffect(
    () => () => {
      if (timeoutRef.current !== undefined) {
        window.clearTimeout(timeoutRef.current);
      }
    },
    [],
  );

  async function handleClick() {
    await copyText(CONTACT_COPY_TEXT);
    setCopied(true);

    if (timeoutRef.current !== undefined) {
      window.clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = window.setTimeout(() => setCopied(false), 1600);
  }

  const Icon = copied ? Check : Copy;

  return (
    <Button
      aria-label={copied ? "Copied email contact details" : "Copy email contact details"}
      onClick={() => void handleClick()}
      type="button"
      {...props}
    >
      <Icon aria-hidden="true" />
      {copied ? "Copied" : "Copy Email"}
    </Button>
  );
}

async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Fall through to the textarea fallback below.
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "true");
  textarea.style.left = "-9999px";
  textarea.style.position = "fixed";
  document.body.append(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}
