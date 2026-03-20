import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface IncomeRecord {
    id: bigint;
    date: string;
    designation: string;
    donorName: string;
    donorAddress: string;
    serialNumber: bigint;
    category: string;
    mobile: string;
    amount: number;
}
export interface ExpenseCategory {
    id: bigint;
    name: string;
}
export interface ExpenseRecord {
    id: bigint;
    date: string;
    proofFileId: string;
    serialNumber: bigint;
    category: string;
    mobile: string;
    recipientAddress: string;
    amount: number;
    recipientName: string;
}
export interface CouncilMember {
    id: bigint;
    council: Council;
    designation: string;
    email: string;
    permanentAddress: string;
    serialNumber: bigint;
    fatherName: string;
    bloodGroup: string;
    memberName: string;
    currentAddress: string;
    mobile: string;
}
export interface ConstitutionChapter {
    id: bigint;
    title: string;
    content: string;
    chapterNumber: bigint;
}
export interface UserProfile {
    name: string;
}
export enum Council {
    upadeshataParishad = "upadeshataParishad",
    sadharanParishad = "sadharanParishad",
    karyanirbahaParishad = "karyanirbahaParishad"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addChapter(title: string, content: string): Promise<ConstitutionChapter>;
    addExpenseCategory(name: string): Promise<ExpenseCategory>;
    addExpenseRecord(date: string, category: string, recipientName: string, recipientAddress: string, mobile: string, amount: number, proofFileId: string): Promise<ExpenseRecord>;
    addIncomeRecord(date: string, category: string, donorName: string, donorAddress: string, mobile: string, amount: number, designation: string): Promise<IncomeRecord>;
    addMember(council: Council, memberName: string, fatherName: string, mobile: string, email: string, bloodGroup: string, currentAddress: string, permanentAddress: string, designation: string): Promise<CouncilMember>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteChapter(id: bigint): Promise<void>;
    deleteExpenseCategory(id: bigint): Promise<void>;
    deleteExpenseRecord(id: bigint): Promise<void>;
    deleteIncomeRecord(id: bigint): Promise<void>;
    deleteMember(id: bigint): Promise<void>;
    getAllChapters(): Promise<Array<ConstitutionChapter>>;
    getAllExpenseCategories(): Promise<Array<ExpenseCategory>>;
    getAllExpenseRecords(): Promise<Array<ExpenseRecord>>;
    getAllIncomeRecords(): Promise<Array<IncomeRecord>>;
    getAllMembers(): Promise<Array<CouncilMember>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMembersByCouncil(council: Council): Promise<Array<CouncilMember>>;
    getNextSerialNumber(): Promise<bigint>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateChapter(id: bigint, title: string, content: string): Promise<void>;
    updateExpenseRecord(id: bigint, updated: ExpenseRecord): Promise<void>;
    updateIncomeRecord(id: bigint, updated: IncomeRecord): Promise<void>;
    updateMember(id: bigint, updated: CouncilMember): Promise<void>;
}
