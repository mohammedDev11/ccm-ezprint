export type ProfileField = {
  id: string;
  label: string;
  value: string;
  sensitive?: boolean;
};

export type ProfileSection = {
  id: string;
  title: string;
  description?: string;
  fields: ProfileField[];
};

export const informationSections: ProfileSection[] = [
  {
    id: "personal-information",
    title: "Personal Information",
    description: "Your main account and identity details.",
    fields: [
      {
        id: "full-name",
        label: "Full Name",
        value: "Mohammed Alshammasi",
      },
      {
        id: "username",
        label: "Username",
        value: "m.alshammasi",
      },
      {
        id: "email",
        label: "Email Address",
        value: "mohammed@kfupm.edu.sa",
      },
      {
        id: "phone",
        label: "Phone Number",
        value: "+966 5X XXX XXXX",
      },
    ],
  },
  {
    id: "university-information",
    title: "University Information",
    description: "Academic and institutional details linked to your account.",
    fields: [
      {
        id: "user-id",
        label: "University ID",
        value: "202279720",
      },
      {
        id: "role",
        label: "Role",
        value: "Student",
      },
      {
        id: "department",
        label: "Department",
        value: "Software Engineering",
      },
      {
        id: "college",
        label: "College",
        value: "College of Computing and Mathematics",
      },
    ],
  },
  {
    id: "printing-identity",
    title: "Printing Identity",
    description: "Information used for printing and secure release.",
    fields: [
      {
        id: "primary-card-id",
        label: "Primary Card ID",
        value: "KFUPM-4582-9931",
        sensitive: true,
      },
      {
        id: "account-quota",
        label: "Account Quota",
        value: "42.50",
      },
      {
        id: "printing-status",
        label: "Printing Status",
        value: "Enabled",
      },
      {
        id: "default-queue",
        label: "Default Queue",
        value: "Secure Release Queue",
      },
    ],
  },
];
