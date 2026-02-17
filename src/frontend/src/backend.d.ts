import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Card {
    id: CardID;
    csvColumnMapping: CsvColumnMapping;
    name: string;
    categoryMappings: Array<CategoryMapping>;
}
export interface CustomCategory {
    id: CustomCategoryID;
    categoryType: CategoryType;
    name: string;
}
export interface CategoryMapping {
    cardProvidedCategory: string;
    customCategoryID: CustomCategoryID;
}
export type CardID = string;
export interface CsvColumnMapping {
    categoryColumn: bigint;
    dateColumn: bigint;
    descriptionColumn: bigint;
    amountColumn: bigint;
}
export type CustomCategoryID = string;
export interface UserProfile {
    name: string;
}
export interface Transaction {
    categoryID: CustomCategoryID;
    date: string;
    description: string;
    amount: number;
}
export enum CategoryType {
    need = "need",
    want = "want"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addCard(id: CardID, name: string, csvMapping: CsvColumnMapping): Promise<boolean>;
    addCategoryMapping(cardId: CardID, mapping: CategoryMapping): Promise<void>;
    addCustomCategory(id: CustomCategoryID, name: string, categoryType: CategoryType): Promise<boolean>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCards(): Promise<Array<Card>>;
    getCustomCategories(): Promise<Array<CustomCategory>>;
    getTransactions(): Promise<Array<Transaction>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    processImportedTransactions(_cardId: CardID, newTransactions: Array<Transaction>): Promise<void>;
    resetTransactions(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateCustomCategoryType(id: CustomCategoryID, categoryType: CategoryType): Promise<boolean>;
}
