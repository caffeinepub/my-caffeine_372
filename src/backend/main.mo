import Map "mo:core/Map";
import Set "mo:core/Set";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

import MixinStorage "blob-storage/Mixin";


actor {
  type Council = {
    #sadharanParishad;
    #karyanirbahaParishad;
    #upadeshataParishad;
  };

  type CouncilMember = {
    id : Nat;
    serialNumber : Nat;
    council : Council;
    memberName : Text;
    fatherName : Text;
    mobile : Text;
    email : Text;
    bloodGroup : Text;
    currentAddress : Text;
    permanentAddress : Text;
    designation : Text;
  };

  type ConstitutionChapter = {
    id : Nat;
    chapterNumber : Nat;
    title : Text;
    content : Text;
  };

  type IncomeRecord = {
    id : Nat;
    serialNumber : Nat;
    date : Text;
    category : Text;
    donorName : Text;
    donorAddress : Text;
    mobile : Text;
    amount : Float;
    designation : Text;
  };

  type ExpenseRecord = {
    id : Nat;
    serialNumber : Nat;
    date : Text;
    category : Text;
    recipientName : Text;
    recipientAddress : Text;
    mobile : Text;
    amount : Float;
    proofFileId : Text;
  };

  type ExpenseCategory = {
    id : Nat;
    name : Text;
  };

  public type UserProfile = {
    name : Text;
  };

  // ---- Legacy stable vars kept for upgrade compatibility ----
  type LegacyMemberStatus = { #active; #inactive };
  type LegacyMembershipRole = { #member; #volunteer; #board };
  type LegacyMember = {
    id : Principal;
    name : Text;
    email : Text;
    phone : Text;
    role : LegacyMembershipRole;
    joinDate : Int;
    status : LegacyMemberStatus;
    notes : Text;
  };
  type LegacyDonationCategory = { #cash; #inKind; #grant };
  type LegacyDonation = {
    id : Nat;
    donorName : Text;
    amount : Float;
    date : Int;
    category : LegacyDonationCategory;
    notes : Text;
    memberId : ?Principal;
  };
  type LegacyEventStatus = { #upcoming; #ongoing; #completed; #cancelled };
  type LegacyEvent = {
    id : Nat;
    title : Text;
    description : Text;
    date : Int;
    location : Text;
    maxAttendees : Nat;
    registeredAttendees : Set.Set<Principal>;
    status : LegacyEventStatus;
  };
  type LegacyProjectStatus = { #planning; #active; #completed; #onHold };
  type LegacyProject = {
    id : Nat;
    title : Text;
    description : Text;
    startDate : Int;
    endDate : Int;
    status : LegacyProjectStatus;
    budget : Float;
    spent : Float;
  };

  let members = Map.empty<Principal, LegacyMember>();
  let donations = Map.empty<Nat, LegacyDonation>();
  let events = Map.empty<Nat, LegacyEvent>();
  let projects = Map.empty<Nat, LegacyProject>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  var nextDonationId : Nat = 0;
  var nextEventId : Nat = 0;
  var nextProjectId : Nat = 0;
  // ---- End legacy vars ----

  // Authorization state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // Remaining legacy stable variables
  var nextId : Nat = 0;
  var nextSerial : Nat = 1;
  let councilMembers = Map.empty<Nat, CouncilMember>();

  // Constitution
  var nextChapterId : Nat = 0;
  var nextChapterNumber : Nat = 1;
  let chapters = Map.empty<Nat, ConstitutionChapter>();

  // Income
  var nextIncomeId : Nat = 0;
  var nextIncomeSerial : Nat = 1;
  let incomeRecords = Map.empty<Nat, IncomeRecord>();

  // Expense
  var nextExpenseId : Nat = 0;
  var nextExpenseSerial : Nat = 1;
  let expenseRecords = Map.empty<Nat, ExpenseRecord>();

  // Expense Categories
  var nextCategoryId : Nat = 0;
  let expenseCategories = Map.empty<Nat, ExpenseCategory>();

  // ===== User Profile functions =====

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // ===== Council Member functions =====

  public query ({ caller }) func getNextSerialNumber() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view serial numbers");
    };
    nextSerial;
  };

  public query ({ caller }) func getAllMembers() : async [CouncilMember] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view members");
    };
    councilMembers.values().toArray();
  };

  public query ({ caller }) func getMembersByCouncil(council : Council) : async [CouncilMember] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view members");
    };
    councilMembers.values().filter(func(m : CouncilMember) : Bool {
      m.council == council;
    }).toArray();
  };

  public shared ({ caller }) func addMember(
    council : Council,
    memberName : Text,
    fatherName : Text,
    mobile : Text,
    email : Text,
    bloodGroup : Text,
    currentAddress : Text,
    permanentAddress : Text,
    designation : Text,
  ) : async CouncilMember {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add members");
    };
    let member : CouncilMember = {
      id = nextId;
      serialNumber = nextSerial;
      council = council;
      memberName = memberName;
      fatherName = fatherName;
      mobile = mobile;
      email = email;
      bloodGroup = bloodGroup;
      currentAddress = currentAddress;
      permanentAddress = permanentAddress;
      designation = designation;
    };
    councilMembers.add(nextId, member);
    nextId += 1;
    nextSerial += 1;
    member;
  };

  public shared ({ caller }) func updateMember(id : Nat, updated : CouncilMember) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update members");
    };
    councilMembers.add(id, updated);
  };

  public shared ({ caller }) func deleteMember(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete members");
    };
    councilMembers.remove(id);
  };

  // ===== Constitution functions =====

  public query func getAllChapters() : async [ConstitutionChapter] {
    chapters.values().toArray();
  };

  public shared ({ caller }) func addChapter(title : Text, content : Text) : async ConstitutionChapter {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add chapters");
    };
    let chapter : ConstitutionChapter = {
      id = nextChapterId;
      chapterNumber = nextChapterNumber;
      title = title;
      content = content;
    };
    chapters.add(nextChapterId, chapter);
    nextChapterId += 1;
    nextChapterNumber += 1;
    chapter;
  };

  public shared ({ caller }) func updateChapter(id : Nat, title : Text, content : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update chapters");
    };
    switch (chapters.get(id)) {
      case (?existing) {
        let updated : ConstitutionChapter = {
          id = existing.id;
          chapterNumber = existing.chapterNumber;
          title = title;
          content = content;
        };
        chapters.add(id, updated);
      };
      case null { Runtime.trap("Chapter not found") };
    };
  };

  public shared ({ caller }) func deleteChapter(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete chapters");
    };
    chapters.remove(id);
  };

  // ===== Income functions =====

  public query ({ caller }) func getAllIncomeRecords() : async [IncomeRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view income records");
    };
    incomeRecords.values().toArray();
  };

  public shared ({ caller }) func addIncomeRecord(
    date : Text,
    category : Text,
    donorName : Text,
    donorAddress : Text,
    mobile : Text,
    amount : Float,
    designation : Text,
  ) : async IncomeRecord {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add income records");
    };
    let record : IncomeRecord = {
      id = nextIncomeId;
      serialNumber = nextIncomeSerial;
      date = date;
      category = category;
      donorName = donorName;
      donorAddress = donorAddress;
      mobile = mobile;
      amount = amount;
      designation = designation;
    };
    incomeRecords.add(nextIncomeId, record);
    nextIncomeId += 1;
    nextIncomeSerial += 1;
    record;
  };

  public shared ({ caller }) func updateIncomeRecord(id : Nat, updated : IncomeRecord) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update income records");
    };
    incomeRecords.add(id, updated);
  };

  public shared ({ caller }) func deleteIncomeRecord(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete income records");
    };
    incomeRecords.remove(id);
  };

  // ===== Expense functions =====

  public query ({ caller }) func getAllExpenseRecords() : async [ExpenseRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view expense records");
    };
    expenseRecords.values().toArray();
  };

  public shared ({ caller }) func addExpenseRecord(
    date : Text,
    category : Text,
    recipientName : Text,
    recipientAddress : Text,
    mobile : Text,
    amount : Float,
    proofFileId : Text,
  ) : async ExpenseRecord {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add expense records");
    };
    let record : ExpenseRecord = {
      id = nextExpenseId;
      serialNumber = nextExpenseSerial;
      date = date;
      category = category;
      recipientName = recipientName;
      recipientAddress = recipientAddress;
      mobile = mobile;
      amount = amount;
      proofFileId = proofFileId;
    };
    expenseRecords.add(nextExpenseId, record);
    nextExpenseId += 1;
    nextExpenseSerial += 1;
    record;
  };

  public shared ({ caller }) func updateExpenseRecord(id : Nat, updated : ExpenseRecord) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update expense records");
    };
    expenseRecords.add(id, updated);
  };

  public shared ({ caller }) func deleteExpenseRecord(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete expense records");
    };
    expenseRecords.remove(id);
  };

  // ===== Expense Categories =====

  public query func getAllExpenseCategories() : async [ExpenseCategory] {
    expenseCategories.values().toArray();
  };

  public shared ({ caller }) func addExpenseCategory(name : Text) : async ExpenseCategory {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add expense categories");
    };
    let cat : ExpenseCategory = { id = nextCategoryId; name = name };
    expenseCategories.add(nextCategoryId, cat);
    nextCategoryId += 1;
    cat;
  };

  public shared ({ caller }) func deleteExpenseCategory(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete expense categories");
    };
    expenseCategories.remove(id);
  };
};
