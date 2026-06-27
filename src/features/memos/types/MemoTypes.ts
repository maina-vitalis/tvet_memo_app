export interface Memo {
  id: string;
  title: string;
  body: string;
  attachmentUrl?: string;
  publishedAt: string;
  isAcknowledged: boolean;
}

export type MemoTag = {
  label: string;
  tone: "primary" | "destructive" | "muted";
  showWarning?: boolean;
};

export type MemoBodyBlock =
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "signature"; lines: string[] };

export type MemoAttachment = {
  id: string;
  fileName: string;
  sizeLabel: string;
  category: string;
};

export type MemoDetail = {
  id: string;
  title: string;
  author: string;
  authorRole?: string;
  publishedAt: string;
  priority?: "urgent" | "normal";
  body: MemoBodyBlock[];
  attachments: MemoAttachment[];
  requiresAcknowledgement?: boolean;
};

export type MemoFeedItem = {
  id: string;
  author: string;
  meta: string;
  title: string;
  excerpt: string;
  tags: MemoTag[];
  avatarUri?: string;
  avatarFallbackIcon?: "campaign";
  unread?: boolean;
  acknowledged?: boolean;
  bookmarked?: boolean;
  titleEmphasis?: "headline" | "label";
};

export const MEMO_DETAILS: Record<string, MemoDetail> = {
  "1": {
    id: "1",
    title:
      "Mandatory Curriculum Updates for Engineering Faculties (Q3 2024)",
    author: "Dr. Alistair Vance",
    authorRole: "Dean of Engineering",
    publishedAt: "Oct 24, 2023, 09:15 AM",
    priority: "urgent",
    requiresAcknowledgement: true,
    body: [
      { type: "paragraph", text: "Dear Faculty Members," },
      {
        type: "paragraph",
        text: "Please be advised that the national TVET accreditation board has issued a revised set of core competencies required for all Year 2 Advanced Manufacturing and Mechatronics courses, effective immediately for the upcoming semester.",
      },
      {
        type: "paragraph",
        text: "The primary focus of these updates revolves around integrating sustainable energy practices and IoT diagnostics into existing mechanical troubleshooting modules. You will find the detailed breakdown of the revised syllabi attached to this memorandum.",
      },
      {
        type: "list",
        items: [
          "Module MECH-201: Addition of 15 hours dedicated to automated fault detection.",
          "Module ELEC-204: Mandatory inclusion of solar-inverter integration practicals.",
          "Assessment Criteria: Lab practicals now carry a 60% weighting (up from 50%).",
        ],
      },
      {
        type: "paragraph",
        text: "It is imperative that all instructors review these changes and update their lesson plans prior to the departmental audit scheduled for November 15th. Failure to comply may result in module suspension.",
      },
      {
        type: "paragraph",
        text: "Please acknowledge receipt of this memo using the action below once you have downloaded and reviewed the attached documentation.",
      },
      {
        type: "signature",
        lines: ["Regards,", "Office of the Dean"],
      },
    ],
    attachments: [
      {
        id: "att-1",
        fileName: "Curriculum_Update_Q3_2024.pdf",
        sizeLabel: "2.4 MB",
        category: "Official Documentation",
      },
    ],
  },
  "2": {
    id: "2",
    title: "Q3 Maintenance Schedule Notification",
    author: "Campus Administration",
    publishedAt: "Yesterday, 2:15 PM",
    priority: "normal",
    body: [
      {
        type: "paragraph",
        text: "The main campus HVAC systems will undergo scheduled maintenance this coming weekend. Building B will experience brief power interruptions. Plan your weekend access accordingly.",
      },
    ],
    attachments: [],
  },
  "3": {
    id: "3",
    title: "New CNC Machining Module Materials Available",
    author: "Prof. Marcus Thorne",
    authorRole: "Advanced Manufacturing",
    publishedAt: "Nov 12",
    priority: "normal",
    body: [
      {
        type: "paragraph",
        text: "I've uploaded the supplementary CAD files and toolpath simulations for next week's advanced milling module. Please review them before the lecture to ensure we can jump straight into the practical demonstration.",
      },
    ],
    attachments: [],
  },
};

export const FEED_ITEMS: MemoFeedItem[] = [
  {
    id: "1",
    author: "Dr. Alistair Vance",
    meta: "Dean of Engineering • Oct 24, 2023",
    title: "Mandatory Curriculum Updates for Engineering Faculties (Q3 2024)",
    excerpt:
      "Please be advised that the national TVET accreditation board has issued a revised set of core competencies required for all Year 2 Advanced Manufacturing and Mechatronics courses.",
    tags: [
      { label: "Curriculum", tone: "primary" },
      { label: "Urgent", tone: "destructive", showWarning: true },
    ],
    avatarUri:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAdoao7txQO7r2sVFWtY5AazrcuOdMEuQE7OyNXuCl3WN_SOJilGil9QvdBuxWbOpXQpxDN5D98ngYUs3VMKFpH_XS-ZYojtNFcJSm4JUWu0ja86R5Cj8kY4eBULsN3hPTE96WPHNyUPT3MqiBgZZECAUpnQrBibG1DKCT6oiZZ-xOyqBMTQk5kMO1NwPIuYKrGG9IyweZzNxQUpPaLFgWB3qnQvak0G7d4Dp76YNRu63FszFZBalmBZ31E4kWGbMt0-ZhiNv922SfH",
    unread: true,
    bookmarked: true,
    titleEmphasis: "headline",
  },
  {
    id: "2",
    author: "Campus Administration",
    meta: "Yesterday, 2:15 PM",
    title: "Q3 Maintenance Schedule Notification",
    excerpt:
      "The main campus HVAC systems will undergo scheduled maintenance this coming weekend. Building B will experience brief power interruptions. Plan your weekend access accordingly.",
    tags: [{ label: "Facilities", tone: "muted" }],
    avatarFallbackIcon: "campaign",
    acknowledged: true,
    titleEmphasis: "label",
  },
  {
    id: "3",
    author: "Prof. Marcus Thorne",
    meta: "Advanced Manufacturing • Nov 12",
    title: "New CNC Machining Module Materials Available",
    excerpt:
      "I've uploaded the supplementary CAD files and toolpath simulations for next week's advanced milling module. Please review them before the lecture to ensure we can jump straight into the practical demonstration.",
    tags: [{ label: "Course Material", tone: "muted" }],
    avatarUri:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuASneBC6J4_qquzep4tXr_Bt7_BmqVAQXLYFlPG0gkv_DA0mm62M_Wh2U9ghNu2On7pmhX_NUL9zLXw3DE8BrNEVGMk_OXnKA49Xb1lASYGIpXBt5KXkmLC1ULWkzgOGDDmymX6USIb4iO931N-m9EUuklhV1ozZB9xavD6MikrJTAau9N_val8HGuprEZ3jQdDG5qn7iSiAhg10KnYKB0rVglFI4Ya2w24QGJetAvSSC__BvvPhUYwJNxebhgAYsQqmjxzJyd3CpuZ",
    bookmarked: true,
    titleEmphasis: "label",
  },
];

export function getMemoDetail(id: string): MemoDetail | undefined {
  return MEMO_DETAILS[id];
}

export function getBookmarkedFeedItems(): MemoFeedItem[] {
  return FEED_ITEMS.filter((item) => item.bookmarked);
}