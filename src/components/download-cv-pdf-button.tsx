import { RiFileDownloadLine } from "@remixicon/react";
import type * as React from "react";
import { Button } from "@/components/ui/button";
import cvPdfUrl from "../../cv/eugene_mirotin_cv.pdf?url";

type DownloadCvPdfButtonProps = Omit<
  React.ComponentProps<typeof Button>,
  "children" | "nativeButton" | "render"
>;

export function DownloadCvPdfButton({ variant = "outline", ...props }: DownloadCvPdfButtonProps) {
  return (
    <Button
      nativeButton={false}
      render={<a download="eugene_mirotin_cv.pdf" href={cvPdfUrl} />}
      variant={variant}
      {...props}
    >
      <RiFileDownloadLine aria-hidden="true" />
      Download PDF
    </Button>
  );
}
