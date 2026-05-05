export type PrinterStatus = "Online" | "Offline" | "Low Toner" | "Paper Jam";

export type PrinterCapability =
  | "Duplex"
  | "Color"
  | "B&W"
  | "Secure Release"
  | "Scan"
  | "Copy";

export type PrinterDeviceType = "Physical" | "Virtual";

export type PrinterItem = {
  id: string;
  name: string;
  model: string;
  location: string;
  building: string;
  room: string;
  department: string;

  status: PrinterStatus;
  capabilities: PrinterCapability[];

  totalPagesPrinted: number;
  totalJobsSubmitted: number;
  costPerPage: number;

  ipAddress: string;
  queueName: string;
  serialNumber: string;
  deviceType: PrinterDeviceType;
  tonerLevel: number;
  paperLevel: number;
  lastUsed: string;
  notes?: string;
};

export const printerStatusOptions: PrinterStatus[] = [
  "Online",
  "Offline",
  "Low Toner",
  "Paper Jam",
];

export const printerGridOptions = [
  { value: "2", label: "2 Columns" },
  { value: "3", label: "3 Columns" },
] as const;

export const printersData: PrinterItem[] = [
  {
    id: "printer-001",
    name: "HP LaserJet 401",
    model: "HP LaserJet 401",
    location: "Building 22, Room 122",
    building: "Building 22",
    room: "122",
    department: "CCM",
    status: "Online",
    capabilities: ["Duplex", "B&W", "Secure Release"],
    totalPagesPrinted: 12400,
    totalJobsSubmitted: 890,
    costPerPage: 0.05,
    ipAddress: "10.10.22.41",
    queueName: "secure-release-b22-122",
    serialNumber: "HP401-KFUPM-001",
    deviceType: "Physical",
    tonerLevel: 78,
    paperLevel: 64,
    lastUsed: "2 min ago",
    notes: "Main student lab printer.",
  },
  {
    id: "printer-002",
    name: "Canon C5535i",
    model: "Canon C5535i",
    location: "Building 22, Room 214",
    building: "Building 22",
    room: "214",
    department: "CCM",
    status: "Online",
    capabilities: ["Duplex", "Color", "B&W", "Secure Release", "Scan", "Copy"],
    totalPagesPrinted: 10200,
    totalJobsSubmitted: 750,
    costPerPage: 0.05,
    ipAddress: "10.10.22.52",
    queueName: "secure-release-b22-214",
    serialNumber: "CAN5535-KFUPM-002",
    deviceType: "Physical",
    tonerLevel: 66,
    paperLevel: 71,
    lastUsed: "1 min ago",
    notes: "Supports color and scanning.",
  },
  {
    id: "printer-003",
    name: "Xerox 7855",
    model: "Xerox 7855",
    location: "Building 23, Room 311",
    building: "Building 23",
    room: "311",
    department: "CCM",
    status: "Low Toner",
    capabilities: ["Color", "B&W", "Copy"],
    totalPagesPrinted: 8900,
    totalJobsSubmitted: 620,
    costPerPage: 0.04,
    ipAddress: "10.10.23.17",
    queueName: "faculty-b23-311",
    serialNumber: "XRX7855-KFUPM-003",
    deviceType: "Physical",
    tonerLevel: 14,
    paperLevel: 83,
    lastUsed: "4 min ago",
    notes: "Needs toner replacement soon.",
  },
  {
    id: "printer-004",
    name: "HP LaserJet 402",
    model: "HP LaserJet 402",
    location: "Building 23, Room 244",
    building: "Building 23",
    room: "244",
    department: "CCM",
    status: "Online",
    capabilities: ["Duplex", "B&W", "Secure Release"],
    totalPagesPrinted: 6800,
    totalJobsSubmitted: 480,
    costPerPage: 0.05,
    ipAddress: "10.10.23.28",
    queueName: "secure-release-b23-244",
    serialNumber: "HP402-KFUPM-004",
    deviceType: "Physical",
    tonerLevel: 73,
    paperLevel: 59,
    lastUsed: "Just now",
    notes: "Used mostly by faculty offices.",
  },
  {
    id: "printer-005",
    name: "Ricoh MP 5002",
    model: "Ricoh MP 5002",
    location: "Building 24, Room 403",
    building: "Building 24",
    room: "403",
    department: "CCM",
    status: "Offline",
    capabilities: ["Duplex", "Color", "B&W", "Copy", "Scan"],
    totalPagesPrinted: 5400,
    totalJobsSubmitted: 390,
    costPerPage: 0.05,
    ipAddress: "10.10.24.61",
    queueName: "lab-b24-403",
    serialNumber: "RICOH5002-KFUPM-005",
    deviceType: "Physical",
    tonerLevel: 52,
    paperLevel: 0,
    lastUsed: "27 min ago",
    notes: "Currently unreachable from network.",
  },
  {
    id: "printer-006",
    name: "Canon C3530i",
    model: "Canon C3530i",
    location: "Library, Room 233",
    building: "Library",
    room: "233",
    department: "Library",
    status: "Online",
    capabilities: ["Duplex", "Color", "B&W", "Scan"],
    totalPagesPrinted: 11200,
    totalJobsSubmitted: 810,
    costPerPage: 0.05,
    ipAddress: "10.10.40.10",
    queueName: "library-room-233",
    serialNumber: "CAN3530-KFUPM-006",
    deviceType: "Physical",
    tonerLevel: 69,
    paperLevel: 88,
    lastUsed: "3 min ago",
    notes: "High-traffic public printer.",
  },
];

export const printerFilterOptions = [
  { value: "all", label: "All Printers" },
  { value: "online", label: "Online" },
  { value: "offline", label: "Offline" },
  { value: "low-toner", label: "Low Toner" },
  { value: "paper-jam", label: "Paper Jam" },
  { value: "color", label: "Color" },
  { value: "bw", label: "B&W" },
  { value: "duplex", label: "Duplex" },
  { value: "secure-release", label: "Secure Release" },
] as const;

export type PrinterFilterValue = (typeof printerFilterOptions)[number]["value"];
