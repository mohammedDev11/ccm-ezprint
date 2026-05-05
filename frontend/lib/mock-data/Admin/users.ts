// export type UserRestrictedStatus = "Locked" | "Unlocked";

// export type UserAccountItem = {
//   id: string;
//   username: string;
//   fullName: string;
//   quota: number;
//   restricted: UserRestrictedStatus;
//   pages: number;
//   jobs: number;
// };

// export type UserSortKey =
//   | "username"
//   | "fullName"
//   | "quota"
//   | "restricted"
//   | "pages"
//   | "jobs";

// export const userAccountsData: UserAccountItem[] = [
//   {
//     id: "user-1",
//     username: "202322750",
//     fullName: "Ali Alorud",
//     quota: 50,
//     restricted: "Locked",
//     pages: 10,
//     jobs: 4,
//   },
//   {
//     id: "user-2",
//     username: "202300245",
//     fullName: "Khalid Alqahtani",
//     quota: 120,
//     restricted: "Unlocked",
//     pages: 84,
//     jobs: 5,
//   },
//   {
//     id: "user-3",
//     username: "a.alshammari",
//     fullName: "Abdullah Alshammari",
//     quota: 300,
//     restricted: "Unlocked",
//     pages: 140,
//     jobs: 9,
//   },
//   {
//     id: "user-4",
//     username: "202301876",
//     fullName: "Fahad Aldossari",
//     quota: 0,
//     restricted: "Locked",
//     pages: 0,
//     jobs: 0,
//   },
//   {
//     id: "user-5",
//     username: "a.almalki",
//     fullName: "Mohammed Almalki",
//     quota: 75,
//     restricted: "Unlocked",
//     pages: 45,
//     jobs: 3,
//   },
//   {
//     id: "user-6",
//     username: "202300981",
//     fullName: "Saad Almutairi",
//     quota: 20,
//     restricted: "Unlocked",
//     pages: 30,
//     jobs: 2,
//   },
// ];

// export const userTableColumns: {
//   key: UserSortKey;
//   label: string;
//   sortable: boolean;
// }[] = [
//   { key: "username", label: "Username", sortable: true },
//   { key: "fullName", label: "Full Name", sortable: true },
//   { key: "quota", label: "Quota", sortable: true },
//   { key: "restricted", label: "Restricted", sortable: true },
//   { key: "pages", label: "Pages", sortable: true },
//   { key: "jobs", label: "Jobs", sortable: true },
// ];

// export const userRestrictedSortOrder: Record<UserRestrictedStatus, number> = {
//   Unlocked: 1,
//   Locked: 2,
// };

//=================NEN=====================
export type UserRestrictedStatus = "Restricted" | "Unrestricted";

export type UserRole = string;
export type UserStanding = string;
export type UserDepartment = string;

export type UserAccountItem = {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  department: UserDepartment;
  standing: UserStanding;
  phone: string;
  quota: number;
  restricted: UserRestrictedStatus;
  pages: number;
  jobs: number;
  lastActivity: string;
  notes: string;
};

export type UserSortKey =
  | "username"
  | "fullName"
  | "quota"
  | "restricted"
  | "pages"
  | "jobs";

export const userAccountsData: UserAccountItem[] = [
  {
    id: "user-1",
    username: "202322750",
    fullName: "Ali Alorud",
    email: "202322750@kfupm.edu.sa",
    role: "Student",
    department: "Software Engineering",
    standing: "Junior",
    phone: "+966 50 111 2233",
    quota: 50,
    restricted: "Restricted",
    pages: 10,
    jobs: 4,
    lastActivity: "2026-04-08 10:24 AM",
    notes: "Needs quota review after repeated failed print attempts.",
  },
  {
    id: "user-2",
    username: "202300245",
    fullName: "Khalid Alqahtani",
    email: "202300245@kfupm.edu.sa",
    role: "Student",
    department: "Computer Science",
    standing: "Senior",
    phone: "+966 55 908 3311",
    quota: 120,
    restricted: "Unrestricted",
    pages: 84,
    jobs: 5,
    lastActivity: "2026-04-09 08:12 AM",
    notes: "Frequently uses color printing for project presentations.",
  },
  {
    id: "user-3",
    username: "a.alshammari",
    fullName: "Abdullah Alshammari",
    email: "a.alshammari@kfupm.edu.sa",
    role: "Faculty",
    department: "Information Systems",
    standing: "Faculty",
    phone: "+966 54 221 9090",
    quota: 300,
    restricted: "Unrestricted",
    pages: 140,
    jobs: 9,
    lastActivity: "2026-04-07 02:44 PM",
    notes: "Has department-level access to faculty queue.",
  },
  {
    id: "user-4",
    username: "202301876",
    fullName: "Fahad Aldossari",
    email: "202301876@kfupm.edu.sa",
    role: "Student",
    department: "Cybersecurity",
    standing: "Junior",
    phone: "+966 53 440 7812",
    quota: 0,
    restricted: "Restricted",
    pages: 0,
    jobs: 0,
    lastActivity: "2026-03-29 11:05 AM",
    notes: "Account restricted due to insufficient balance and manual review.",
  },
  {
    id: "user-5",
    username: "a.almalki",
    fullName: "Mohammed Almalki",
    email: "a.almalki@kfupm.edu.sa",
    role: "Staff",
    department: "Deanship",
    standing: "Staff",
    phone: "+966 56 882 1144",
    quota: 75,
    restricted: "Unrestricted",
    pages: 45,
    jobs: 3,
    lastActivity: "2026-04-06 01:17 PM",
    notes: "Uses secure release queue for administrative printing.",
  },
  {
    id: "user-6",
    username: "202300981",
    fullName: "Saad Almutairi",
    email: "202300981@kfupm.edu.sa",
    role: "Student",
    department: "Mathematics",
    standing: "Senior",
    phone: "+966 59 330 4477",
    quota: 20,
    restricted: "Unrestricted",
    pages: 30,
    jobs: 2,
    lastActivity: "2026-04-05 09:38 AM",
    notes: "Low balance warning was shown last week.",
  },
];

export const userTableColumns: {
  key: UserSortKey;
  label: string;
  sortable: boolean;
}[] = [
  { key: "username", label: "Username", sortable: true },
  { key: "fullName", label: "Full Name", sortable: true },
  { key: "quota", label: "Quota", sortable: true },
  { key: "restricted", label: "Restricted", sortable: true },
  { key: "pages", label: "Pages", sortable: true },
  { key: "jobs", label: "Jobs", sortable: true },
];

export const userRestrictedSortOrder: Record<UserRestrictedStatus, number> = {
  Unrestricted: 1,
  Restricted: 2,
};
