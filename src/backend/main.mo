import Map "mo:core/Map";
import List "mo:core/List";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Migration "migration";

(with migration = Migration.run)
actor {
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

  public type UserProfile = {
    name : Text;
  };

  type UserData = {
    customCategories : Map.Map<CustomCategoryID, CustomCategory>;
    cards : Map.Map<CardID, Card>;
    transactions : List.List<Transaction>;
  };

  // Persistent storage
  let persistentUserProfiles = Map.empty<Principal, UserProfile>();
  let persistentUserData = Map.empty<Principal, UserData>();

  // Temporary storage for current operation
  var currentUserProfiles : ?Map.Map<Principal, UserProfile> = null;
  var currentUserData : ?Map.Map<Principal, UserData> = null;

  // Helper function to get or create user data
  func getUserData(user : Principal) : UserData {
    let userData = switch (currentUserData) {
      case (null) { persistentUserData };
      case (?data) { data };
    };
    switch (userData.get(user)) {
      case (?data) { data };
      case (null) {
        let newData : UserData = {
          customCategories = Map.empty<CustomCategoryID, CustomCategory>();
          cards = Map.empty<CardID, Card>();
          transactions = List.empty<Transaction>();
        };
        userData.add(user, newData);
        newData;
      };
    };
  };

  // Authentication and Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    switch (currentUserProfiles) {
      case (null) { persistentUserProfiles.get(caller) };
      case (?profiles) { profiles.get(caller) };
    };
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    switch (currentUserProfiles) {
      case (null) { persistentUserProfiles.get(user) };
      case (?profiles) { profiles.get(user) };
    };
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    let userProfiles = switch (currentUserProfiles) {
      case (null) { persistentUserProfiles };
      case (?profiles) { profiles };
    };
    currentUserProfiles := null;
    userProfiles.add(caller, profile);
  };

  // CUSTOM CATEGORY MANAGEMENT
  public shared ({ caller }) func addCustomCategory(id : CustomCategoryID, name : Text, categoryType : CategoryType) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add custom categories");
    };
    let data = getUserData(caller);
    let customCategory : CustomCategory = {
      id;
      name;
      categoryType;
    };
    data.customCategories.add(id, customCategory);
    true;
  };

  public shared ({ caller }) func updateCustomCategoryType(id : CustomCategoryID, categoryType : CategoryType) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update custom categories");
    };
    let data = getUserData(caller);
    let oldCategory = switch (data.customCategories.get(id)) {
      case (null) { Runtime.trap("Custom category not found") };
      case (?category) { category };
    };
    let updatedCategory = { oldCategory with categoryType };
    data.customCategories.add(id, updatedCategory);
    true;
  };

  public query ({ caller }) func getCustomCategories() : async [CustomCategory] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view custom categories");
    };
    let data = getUserData(caller);
    data.customCategories.values().toArray();
  };

  // CARD MANAGEMENT
  public shared ({ caller }) func addCard(id : CardID, name : Text, csvMapping : CsvColumnMapping) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add cards");
    };
    let data = getUserData(caller);
    let card : Card = {
      id;
      name;
      csvColumnMapping = csvMapping;
      categoryMappings = [];
    };
    data.cards.add(id, card);
    true;
  };

  public shared ({ caller }) func addCategoryMapping(cardId : CardID, mapping : CategoryMapping) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add category mappings");
    };
    let data = getUserData(caller);
    let card = switch (data.cards.get(cardId)) {
      case (null) { Runtime.trap("Card not found") };
      case (?card) { card };
    };
    let oldMappings = card.categoryMappings;
    let updatedMappings = oldMappings.concat([mapping]);
    let updatedCard = Card.updateCategoryMappings(card, updatedMappings);
    data.cards.add(cardId, updatedCard);
  };

  public query ({ caller }) func getCards() : async [Card] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view cards");
    };
    let data = getUserData(caller);
    data.cards.values().toArray();
  };

  module Card {
    public func updateCategoryMappings(card : Card, categoryMappings : [CategoryMapping]) : Card {
      { card with categoryMappings };
    };
  };

  // TRANSACTION MANAGEMENT
  public shared ({ caller }) func processImportedTransactions(_cardId : CardID, newTransactions : [Transaction]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can process transactions");
    };
    let data = getUserData(caller);
    data.transactions.clear();
    let arrayAsList = List.fromArray<Transaction>(newTransactions);
    data.transactions.addAll(arrayAsList.values());
  };

  public shared ({ caller }) func resetTransactions() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can reset transactions");
    };
    let data = getUserData(caller);
    data.transactions.clear();
  };

  public query ({ caller }) func getTransactions() : async [Transaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view transactions");
    };
    let data = getUserData(caller);
    data.transactions.toArray();
  };
};
