import Map "mo:core/Map";
import List "mo:core/List";
import Text "mo:core/Text";
import Principal "mo:core/Principal";

module {
  type CustomCategoryID = Text;
  type CardID = Text;

  public type CategoryType = {
    #need;
    #want;
  };

  public type CustomCategory = {
    id : CustomCategoryID;
    name : Text;
    categoryType : CategoryType;
  };

  type CategoryMapping = {
    cardProvidedCategory : Text;
    customCategoryID : CustomCategoryID;
  };

  type CsvColumnMapping = {
    dateColumn : Nat;
    amountColumn : Nat;
    categoryColumn : Nat;
    descriptionColumn : Nat;
  };

  type Transaction = {
    date : Text;
    amount : Float;
    categoryID : CustomCategoryID;
    description : Text;
  };

  type Card = {
    id : CardID;
    name : Text;
    csvColumnMapping : CsvColumnMapping;
    categoryMappings : [CategoryMapping];
  };

  type UserProfile = {
    name : Text;
  };

  type UserData = {
    customCategories : Map.Map<CustomCategoryID, CustomCategory>;
    cards : Map.Map<CardID, Card>;
    transactions : List.List<Transaction>;
  };

  type UpgradedActor = {
    persistentUserProfiles : Map.Map<Principal, UserProfile>;
    persistentUserData : Map.Map<Principal, UserData>;
    currentUserProfiles : ?Map.Map<Principal, UserProfile>;
    currentUserData : ?Map.Map<Principal, UserData>;
  };

  type OutdatedActor = {
    customCategories : Map.Map<CustomCategoryID, Text>;
    cards : Map.Map<CardID, Card>;
    transactions : List.List<Transaction>;
  };

  public func run(old : OutdatedActor) : UpgradedActor {
    {
      persistentUserProfiles = Map.empty<Principal, UserProfile>();
      persistentUserData = Map.empty<Principal, UserData>();
      currentUserProfiles = null;
      currentUserData = null;
    };
  };
};
