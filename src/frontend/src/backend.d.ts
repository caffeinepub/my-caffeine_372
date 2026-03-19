import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface EventView {
    id: bigint;
    status: EventStatus;
    title: string;
    registeredAttendees: Array<Principal>;
    maxAttendees: bigint;
    date: bigint;
    description: string;
    location: string;
}
export interface Donation {
    id: bigint;
    memberId?: Principal;
    date: bigint;
    donorName: string;
    notes: string;
    category: DonationCategory;
    amount: number;
}
export interface Member {
    id: Principal;
    status: MemberStatus;
    joinDate: bigint;
    name: string;
    role: MembershipRole;
    email: string;
    notes: string;
    phone: string;
}
export interface Project {
    id: bigint;
    status: ProjectStatus;
    title: string;
    endDate: bigint;
    description: string;
    spent: number;
    budget: number;
    startDate: bigint;
}
export interface DashboardStats {
    totalActiveMembers: bigint;
    activeProjectsCount: bigint;
    totalDonationsSum: number;
    upcomingEventsCount: bigint;
}
export interface UserProfile {
    name: string;
}
export enum DonationCategory {
    cash = "cash",
    inKind = "inKind",
    grant = "grant"
}
export enum EventStatus {
    upcoming = "upcoming",
    cancelled = "cancelled",
    completed = "completed",
    ongoing = "ongoing"
}
export enum MemberStatus {
    active = "active",
    inactive = "inactive"
}
export enum MembershipRole {
    member = "member",
    board = "board",
    volunteer = "volunteer"
}
export enum ProjectStatus {
    active = "active",
    completed = "completed",
    onHold = "onHold",
    planning = "planning"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addDonation(donation: Donation): Promise<void>;
    addEvent(event: EventView): Promise<void>;
    addMember(member: Member): Promise<void>;
    addProject(project: Project): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteDonation(id: bigint): Promise<void>;
    deleteEvent(id: bigint): Promise<void>;
    deleteMember(id: Principal): Promise<void>;
    deleteProject(id: bigint): Promise<void>;
    getAllDonations(): Promise<Array<Donation>>;
    getAllEvents(): Promise<Array<EventView>>;
    getAllMembers(): Promise<Array<Member>>;
    getAllProjects(): Promise<Array<Project>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDashboardStats(): Promise<DashboardStats>;
    getDonation(id: bigint): Promise<Donation | null>;
    getEvent(id: bigint): Promise<EventView | null>;
    getMember(id: Principal): Promise<Member | null>;
    getProject(id: bigint): Promise<Project | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateDonation(id: bigint, updatedDonation: Donation): Promise<void>;
    updateEvent(id: bigint, updatedEvent: EventView): Promise<void>;
    updateMember(id: Principal, updatedMember: Member): Promise<void>;
    updateProject(id: bigint, updatedProject: Project): Promise<void>;
}
