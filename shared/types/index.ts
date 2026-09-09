// ─── User & Profile ────────────────────────────────────────────────────────

export type Gender = "male" | "female" | "other";
export type MaritalStatus = "never_married" | "divorced" | "widowed" | "separated";
export type Religion =
  | "hindu" | "muslim" | "christian" | "sikh"
  | "jain" | "buddhist" | "jewish" | "other";

export interface UserProfile {
  uid:           string;
  displayName:   string;
  email:         string;
  photoURL:      string | null;
  photos:        string[];          // Firebase Storage URLs
  createdAt:     number;            // epoch ms
  updatedAt:     number;

  // Personal details
  gender:        Gender;
  dateOfBirth:   string;            // ISO date "YYYY-MM-DD"
  age:           number;            // computed, stored for query efficiency
  height:        number;            // cm
  maritalStatus: MaritalStatus;
  religion:      Religion;
  caste?:        string;
  motherTongue?: string;
  nationality:   string;
  location: {
    city:        string;
    state:       string;
    country:     string;
  };

  // Education & Career
  education:     string;
  occupation:    string;
  annualIncome?: string;            // range string e.g. "50k-75k GBP"

  // Family
  familyType?:   "nuclear" | "joint" | "extended";
  familyValues?: "traditional" | "moderate" | "liberal";
  fatherOccupation?: string;
  motherOccupation?: string;
  siblings?:     number;

  // About
  bio:           string;
  hobbies:       string[];

  // Match preferences (stored on profile for Firestore query ease)
  preferences: MatchPreferences;

  // Privacy
  profileVisible: boolean;
  photosBlurred:  boolean;          // blur until interest accepted

  // Status
  profileComplete: boolean;
  verified:        boolean;
}

export interface MatchPreferences {
  ageMin:        number;
  ageMax:        number;
  heightMin?:    number;
  heightMax?:    number;
  religions:     Religion[];
  maritalStatus: MaritalStatus[];
  locations:     string[];          // cities or "Any"
  education?:    string;
}

// ─── Interests / Matches ───────────────────────────────────────────────────

export type InterestStatus = "pending" | "accepted" | "declined";

export interface Interest {
  id:          string;
  fromUid:     string;
  toUid:       string;
  status:      InterestStatus;
  createdAt:   number;
  updatedAt:   number;
  message?:    string;
}

// ─── Chat ──────────────────────────────────────────────────────────────────

export interface Conversation {
  id:           string;
  participants: string[];           // [uid1, uid2]
  lastMessage:  string;
  lastMessageAt: number;
  unreadCount:  Record<string, number>; // { uid: count }
}

export interface Message {
  id:        string;
  convId:    string;
  senderUid: string;
  text:      string;
  createdAt: number;
  read:      boolean;
}

// ─── Notifications ─────────────────────────────────────────────────────────

export type NotificationType =
  | "interest_received"
  | "interest_accepted"
  | "interest_declined"
  | "new_message";

export interface Notification {
  id:        string;
  uid:       string;
  type:      NotificationType;
  fromUid:   string;
  read:      boolean;
  createdAt: number;
  payload?:  Record<string, unknown>;
}
