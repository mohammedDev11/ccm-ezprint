export type WebPrintPrinterOption = {
  label: string;
  value: string;
};

export const webPrintPrinterOptions: WebPrintPrinterOption[] = [
  { label: "CCM Secure Release Printer", value: "ccm-secure-release-printer" },
  { label: "CCM Ground Floor Printer", value: "ccm-ground-floor-printer" },
  { label: "CCM First Floor Printer", value: "ccm-first-floor-printer" },
  { label: "Faculty Queue Printer", value: "faculty-queue-printer" },
  { label: "Computer Lab Printer", value: "computer-lab-printer" },
  { label: "Library Printing Station", value: "library-printing-station" },
];

//===========Actions=============
import {
  IconEye,
  IconPlus,
  IconTrash,
  IconDeviceFloppy,
  IconSparkles,
} from "@tabler/icons-react";

export const printUploadTopActions = [
  {
    id: "add-files",
    label: "Add files",
    icon: IconPlus,
  },
  {
    id: "save-draft",
    label: "Save draft",
    icon: IconDeviceFloppy,
  },
  {
    id: "smart-fix",
    label: "Smart fix",
    icon: IconSparkles,
  },
];

export const printUploadFileActions = [
  {
    id: "preview-file",
    label: "Preview",
    icon: IconEye,
  },
  {
    id: "delete-file",
    label: "Delete",
    icon: IconTrash,
  },
];
