import Map "mo:core/Map";
import Set "mo:core/Set";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Float "mo:core/Float";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Text "mo:core/Text";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import AccessControl "mo:caffeineai-authorization/access-control";

import MixinObjectStorage "mo:caffeineai-object-storage/Mixin";


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

  type NoticeRecord = {
    id : Nat;
    date : Text;
    noticeNo : Text;
    title : Text;
    body : Text;
    authority : Text;
    savedAt : Text;
  };

  type ResolutionRecord = {
    id : Nat;
    date : Text;
    resNo : Text;
    meetingType : Text;
    venue : Text;
    presiding : Text;
    attendees : Text;
    resolutions : Text;
    secretary : Text;
    savedAt : Text;
  };

  public type UserProfile = {
    name : Text;
  };

  type FamilyNode = {
    id : Text;
    name : Text;
    parentId : ?Text;
    generationLevel : Nat;
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
  include MixinObjectStorage();

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

  // Notices
  var nextNoticeId : Nat = 0;
  let noticeRecords = Map.empty<Nat, NoticeRecord>();

  // Resolutions
  var nextResolutionId : Nat = 0;
  let resolutionRecords = Map.empty<Nat, ResolutionRecord>();

  // Family Tree
  let familyNodes = Map.empty<Text, FamilyNode>();

  // ===== JSON helpers =====

  func escapeJson(t : Text) : Text {
    var result = "";
    for (c in t.toIter()) {
      if (c == '\"') { result := result # "\\\"" }
      else if (c == '\\') { result := result # "\\\\" }
      else if (c == '\n') { result := result # "\\n" }
      else if (c == '\r') { result := result # "\\r" }
      else if (c == '\t') { result := result # "\\t" }
      else { result := result # (Text.fromChar c) }
    };
    result;
  };

  func councilToText(c : Council) : Text {
    switch (c) {
      case (#sadharanParishad) "sadharanParishad";
      case (#karyanirbahaParishad) "karyanirbahaParishad";
      case (#upadeshataParishad) "upadeshataParishad";
    };
  };

  func councilFromText(t : Text) : Council {
    if (t == "karyanirbahaParishad") { #karyanirbahaParishad }
    else if (t == "upadeshataParishad") { #upadeshataParishad }
    else { #sadharanParishad }
  };

  func memberToJson(m : CouncilMember) : Text {
    "{\"id\":" # m.id.toText() #
    ",\"serialNumber\":" # m.serialNumber.toText() #
    ",\"council\":\"" # escapeJson(councilToText(m.council)) # "\"" #
    ",\"memberName\":\"" # escapeJson(m.memberName) # "\"" #
    ",\"fatherName\":\"" # escapeJson(m.fatherName) # "\"" #
    ",\"mobile\":\"" # escapeJson(m.mobile) # "\"" #
    ",\"email\":\"" # escapeJson(m.email) # "\"" #
    ",\"bloodGroup\":\"" # escapeJson(m.bloodGroup) # "\"" #
    ",\"currentAddress\":\"" # escapeJson(m.currentAddress) # "\"" #
    ",\"permanentAddress\":\"" # escapeJson(m.permanentAddress) # "\"" #
    ",\"designation\":\"" # escapeJson(m.designation) # "\"}"
  };

  func chapterToJson(c : ConstitutionChapter) : Text {
    "{\"id\":" # c.id.toText() #
    ",\"chapterNumber\":" # c.chapterNumber.toText() #
    ",\"title\":\"" # escapeJson(c.title) # "\"" #
    ",\"content\":\"" # escapeJson(c.content) # "\"}"
  };

  func incomeToJson(r : IncomeRecord) : Text {
    "{\"id\":" # r.id.toText() #
    ",\"serialNumber\":" # r.serialNumber.toText() #
    ",\"date\":\"" # escapeJson(r.date) # "\"" #
    ",\"category\":\"" # escapeJson(r.category) # "\"" #
    ",\"donorName\":\"" # escapeJson(r.donorName) # "\"" #
    ",\"donorAddress\":\"" # escapeJson(r.donorAddress) # "\"" #
    ",\"mobile\":\"" # escapeJson(r.mobile) # "\"" #
    ",\"amount\":" # r.amount.toText() #
    ",\"designation\":\"" # escapeJson(r.designation) # "\"}"
  };

  func expenseToJson(r : ExpenseRecord) : Text {
    "{\"id\":" # r.id.toText() #
    ",\"serialNumber\":" # r.serialNumber.toText() #
    ",\"date\":\"" # escapeJson(r.date) # "\"" #
    ",\"category\":\"" # escapeJson(r.category) # "\"" #
    ",\"recipientName\":\"" # escapeJson(r.recipientName) # "\"" #
    ",\"recipientAddress\":\"" # escapeJson(r.recipientAddress) # "\"" #
    ",\"mobile\":\"" # escapeJson(r.mobile) # "\"" #
    ",\"amount\":" # r.amount.toText() #
    ",\"proofFileId\":\"" # escapeJson(r.proofFileId) # "\"}"
  };

  func categoryToJson(c : ExpenseCategory) : Text {
    "{\"id\":" # c.id.toText() #
    ",\"name\":\"" # escapeJson(c.name) # "\"}"
  };

  func noticeToJson(n : NoticeRecord) : Text {
    "{\"id\":" # n.id.toText() #
    ",\"date\":\"" # escapeJson(n.date) # "\"" #
    ",\"noticeNo\":\"" # escapeJson(n.noticeNo) # "\"" #
    ",\"title\":\"" # escapeJson(n.title) # "\"" #
    ",\"body\":\"" # escapeJson(n.body) # "\"" #
    ",\"authority\":\"" # escapeJson(n.authority) # "\"" #
    ",\"savedAt\":\"" # escapeJson(n.savedAt) # "\"}"
  };

  func resolutionToJson(r : ResolutionRecord) : Text {
    "{\"id\":" # r.id.toText() #
    ",\"date\":\"" # escapeJson(r.date) # "\"" #
    ",\"resNo\":\"" # escapeJson(r.resNo) # "\"" #
    ",\"meetingType\":\"" # escapeJson(r.meetingType) # "\"" #
    ",\"venue\":\"" # escapeJson(r.venue) # "\"" #
    ",\"presiding\":\"" # escapeJson(r.presiding) # "\"" #
    ",\"attendees\":\"" # escapeJson(r.attendees) # "\"" #
    ",\"resolutions\":\"" # escapeJson(r.resolutions) # "\"" #
    ",\"secretary\":\"" # escapeJson(r.secretary) # "\"" #
    ",\"savedAt\":\"" # escapeJson(r.savedAt) # "\"}"
  };

  func familyNodeToJson(n : FamilyNode) : Text {
    let parentStr = switch (n.parentId) {
      case (?pid) "\"" # escapeJson(pid) # "\"";
      case null "null";
    };
    "{\"id\":\"" # escapeJson(n.id) # "\"" #
    ",\"name\":\"" # escapeJson(n.name) # "\"" #
    ",\"parentId\":" # parentStr #
    ",\"generationLevel\":" # n.generationLevel.toText() # "}"
  };

  func arrayToJsonArray(items : [Text]) : Text {
    var result = "[";
    var first = true;
    for (item in items.vals()) {
      if (not first) { result := result # "," };
      result := result # item;
      first := false;
    };
    result # "]"
  };

  // ===== JSON import helpers =====

  // Extract value for a key from a flat JSON object string (single-level, no nesting)
  func extractJsonField(json : Text, key : Text) : Text {
    let search = "\"" # key # "\":";
    let parts = json.split(#text search);
    switch (parts.next()) {
      case null { "" };
      case (?_before) {
        switch (parts.next()) {
          case null { "" };
          case (?after) {
            let trimmed = after.trimStart(#char ' ');
            if (trimmed.startsWith(#char '\"')) {
              // string value
              let inner = trimmed.trimStart(#char '\"');
              // find closing quote (not escaped)
              var result = "";
              var escape = false;
              var done = false;
              for (c in inner.toIter()) {
                if (done) {}
                else if (escape) {
                  if (c == 'n') { result := result # "\n" }
                  else if (c == 'r') { result := result # "\r" }
                  else if (c == 't') { result := result # "\t" }
                  else { result := result # (Text.fromChar c) };
                  escape := false;
                } else if (c == '\\') {
                  escape := true;
                } else if (c == '\"') {
                  done := true;
                } else {
                  result := result # (Text.fromChar c);
                }
              };
              result
            } else {
              // numeric or null value — take until comma, }, or ]
              var result = "";
              for (c in trimmed.toIter()) {
                if (c == ',' or c == '}' or c == ']') {}
                else { result := result # (Text.fromChar c) }
              };
              result.trimEnd(#char ' ')
            }
          };
        }
      };
    }
  };

  func parseNat(t : Text) : Nat {
    switch (Nat.fromText(t)) {
      case (?n) n;
      case null 0;
    }
  };

  func parseFloat(t : Text) : Float {
    // Parse "123.45" or "123" from text
    let trimmed = t.trimStart(#char ' ').trimEnd(#char ' ');
    let parts = trimmed.split(#char '.');
    let intPart = switch (parts.next()) {
      case (?p) p;
      case null "0";
    };
    let fracPart = switch (parts.next()) {
      case (?p) p;
      case null "0";
    };
    let intVal : Float = switch (Int.fromText(intPart)) {
      case (?n) n.toFloat();
      case null 0.0;
    };
    let fracLen = fracPart.size();
    if (fracLen == 0) { return intVal };
    let fracVal : Float = switch (Nat.fromText(fracPart)) {
      case (?n) n.toFloat();
      case null 0.0;
    };
    // divide fracVal by 10^fracLen
    var divisor : Float = 1.0;
    var i = 0;
    while (i < fracLen) {
      divisor := divisor * 10.0;
      i += 1;
    };
    if (intVal < 0.0) { intVal - fracVal / divisor }
    else { intVal + fracVal / divisor }
  };

  func parseOptText(t : Text) : ?Text {
    if (t == "null" or t == "") { null } else { ?t }
  };

  // Split a JSON array string "[{...},{...}]" into individual object strings
  func splitJsonObjects(arr : Text) : [Text] {
    // Strip outer brackets
    let inner = arr.trimStart(#char '[').trimEnd(#char ']').trimStart(#char ' ').trimEnd(#char ' ');
    if (inner == "" or inner == "null") { return [] };
    // Split by object boundaries: count braces
    var objects : [Text] = [];
    var current = "";
    var depth = 0;
    for (c in inner.toIter()) {
      if (c == '{') {
        depth += 1;
        current := current # (Text.fromChar c);
      } else if (c == '}') {
        current := current # (Text.fromChar c);
        depth -= 1;
        if (depth == 0) {
          objects := objects.concat([current]);
          current := "";
        }
      } else {
        current := current # (Text.fromChar c);
      }
    };
    objects
  };

  // Extract a top-level array value from a JSON object (handles nested objects)
  func extractJsonArray(json : Text, key : Text) : Text {
    let search = "\"" # key # "\":";
    let parts = json.split(#text search);
    switch (parts.next()) {
      case null { "[]" };
      case (?_before) {
        switch (parts.next()) {
          case null { "[]" };
          case (?after) {
            let trimmed = after.trimStart(#char ' ');
            if (not trimmed.startsWith(#char '[')) { return "[]" };
            var result = "";
            var depth = 0;
            var done = false;
            for (c in trimmed.toIter()) {
              if (done) {}
              else {
                result := result # (Text.fromChar c);
                if (c == '[' or c == '{') { depth += 1 }
                else if (c == ']' or c == '}') {
                  depth -= 1;
                  if (depth == 0) { done := true }
                }
              }
            };
            result
          };
        }
      };
    }
  };

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

  // ===== Notice functions =====

  public query func getAllNotices() : async [NoticeRecord] {
    noticeRecords.values().toArray();
  };

  public shared ({ caller }) func addNotice(
    date : Text,
    noticeNo : Text,
    title : Text,
    body : Text,
    authority : Text,
    savedAt : Text,
  ) : async NoticeRecord {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add notices");
    };
    let record : NoticeRecord = {
      id = nextNoticeId;
      date = date;
      noticeNo = noticeNo;
      title = title;
      body = body;
      authority = authority;
      savedAt = savedAt;
    };
    noticeRecords.add(nextNoticeId, record);
    nextNoticeId += 1;
    record;
  };

  public shared ({ caller }) func deleteNotice(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete notices");
    };
    noticeRecords.remove(id);
  };

  // ===== Resolution functions =====

  public query func getAllResolutions() : async [ResolutionRecord] {
    resolutionRecords.values().toArray();
  };

  public shared ({ caller }) func addResolution(
    date : Text,
    resNo : Text,
    meetingType : Text,
    venue : Text,
    presiding : Text,
    attendees : Text,
    resolutions : Text,
    secretary : Text,
    savedAt : Text,
  ) : async ResolutionRecord {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add resolutions");
    };
    let record : ResolutionRecord = {
      id = nextResolutionId;
      date = date;
      resNo = resNo;
      meetingType = meetingType;
      venue = venue;
      presiding = presiding;
      attendees = attendees;
      resolutions = resolutions;
      secretary = secretary;
      savedAt = savedAt;
    };
    resolutionRecords.add(nextResolutionId, record);
    nextResolutionId += 1;
    record;
  };


  // ===== Family Tree functions =====

  public query func getAllFamilyNodes() : async [FamilyNode] {
    familyNodes.values().toArray();
  };

  public shared func upsertFamilyNode(
    id : Text,
    name : Text,
    parentId : ?Text,
    generationLevel : Nat,
  ) : async FamilyNode {
    let node : FamilyNode = {
      id = id;
      name = name;
      parentId = parentId;
      generationLevel = generationLevel;
    };
    familyNodes.add(id, node);
    node;
  };

  public shared func deleteFamilyNode(id : Text) : async () {
    familyNodes.remove(id);
  };

  public shared func setAllFamilyNodes(nodes : [FamilyNode]) : async () {
    familyNodes.clear();
    for (node in nodes.vals()) {
      familyNodes.add(node.id, node);
    };
  };

  public shared ({ caller }) func deleteResolution(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete resolutions");
    };
    resolutionRecords.remove(id);
  };

  // ===== Bulk Export (public, no auth required) =====

  public query func bulkExport() : async Text {
    let membersArr = councilMembers.values().map(func(m : CouncilMember) : Text { memberToJson(m) }).toArray();
    let chaptersArr = chapters.values().map(func(c : ConstitutionChapter) : Text { chapterToJson(c) }).toArray();
    let incomeArr = incomeRecords.values().map(func(r : IncomeRecord) : Text { incomeToJson(r) }).toArray();
    let expenseArr = expenseRecords.values().map(func(r : ExpenseRecord) : Text { expenseToJson(r) }).toArray();
    let categoriesArr = expenseCategories.values().map(func(c : ExpenseCategory) : Text { categoryToJson(c) }).toArray();
    let noticesArr = noticeRecords.values().map(func(n : NoticeRecord) : Text { noticeToJson(n) }).toArray();
    let resolutionsArr = resolutionRecords.values().map(func(r : ResolutionRecord) : Text { resolutionToJson(r) }).toArray();
    let nodesArr = familyNodes.values().map(func(n : FamilyNode) : Text { familyNodeToJson(n) }).toArray();

    "{\"version\":\"1.0\"" #
    ",\"members\":" # arrayToJsonArray(membersArr) #
    ",\"constitutionChapters\":" # arrayToJsonArray(chaptersArr) #
    ",\"incomeRecords\":" # arrayToJsonArray(incomeArr) #
    ",\"expenseRecords\":" # arrayToJsonArray(expenseArr) #
    ",\"expenseCategories\":" # arrayToJsonArray(categoriesArr) #
    ",\"notices\":" # arrayToJsonArray(noticesArr) #
    ",\"resolutions\":" # arrayToJsonArray(resolutionsArr) #
    ",\"familyNodes\":" # arrayToJsonArray(nodesArr) #
    "}"
  };

  // ===== Bulk Import (admin only) =====

  public shared ({ caller }) func bulkImport(jsonData : Text) : async { success : Bool; message : Text; counts : Text } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can import data");
    };

    // Parse and import members
    let membersJson = extractJsonArray(jsonData, "members");
    let memberObjs = splitJsonObjects(membersJson);
    councilMembers.clear();
    var memberCount = 0;
    var maxMemberId : Nat = 0;
    var maxMemberSerial : Nat = 0;
    for (obj in memberObjs.vals()) {
      let id = parseNat(extractJsonField(obj, "id"));
      let serial = parseNat(extractJsonField(obj, "serialNumber"));
      let m : CouncilMember = {
        id = id;
        serialNumber = serial;
        council = councilFromText(extractJsonField(obj, "council"));
        memberName = extractJsonField(obj, "memberName");
        fatherName = extractJsonField(obj, "fatherName");
        mobile = extractJsonField(obj, "mobile");
        email = extractJsonField(obj, "email");
        bloodGroup = extractJsonField(obj, "bloodGroup");
        currentAddress = extractJsonField(obj, "currentAddress");
        permanentAddress = extractJsonField(obj, "permanentAddress");
        designation = extractJsonField(obj, "designation");
      };
      councilMembers.add(id, m);
      memberCount += 1;
      if (id >= maxMemberId) { maxMemberId := id + 1 };
      if (serial >= maxMemberSerial) { maxMemberSerial := serial + 1 };
    };
    if (memberCount > 0) {
      nextId := maxMemberId;
      nextSerial := maxMemberSerial;
    };

    // Parse and import constitution chapters
    let chaptersJson = extractJsonArray(jsonData, "constitutionChapters");
    let chapterObjs = splitJsonObjects(chaptersJson);
    chapters.clear();
    var chapterCount = 0;
    var maxChapterId : Nat = 0;
    var maxChapterNum : Nat = 0;
    for (obj in chapterObjs.vals()) {
      let id = parseNat(extractJsonField(obj, "id"));
      let num = parseNat(extractJsonField(obj, "chapterNumber"));
      let c : ConstitutionChapter = {
        id = id;
        chapterNumber = num;
        title = extractJsonField(obj, "title");
        content = extractJsonField(obj, "content");
      };
      chapters.add(id, c);
      chapterCount += 1;
      if (id >= maxChapterId) { maxChapterId := id + 1 };
      if (num >= maxChapterNum) { maxChapterNum := num + 1 };
    };
    if (chapterCount > 0) {
      nextChapterId := maxChapterId;
      nextChapterNumber := maxChapterNum;
    };

    // Parse and import income records
    let incomeJson = extractJsonArray(jsonData, "incomeRecords");
    let incomeObjs = splitJsonObjects(incomeJson);
    incomeRecords.clear();
    var incomeCount = 0;
    var maxIncomeId : Nat = 0;
    var maxIncomeSerial : Nat = 0;
    for (obj in incomeObjs.vals()) {
      let id = parseNat(extractJsonField(obj, "id"));
      let serial = parseNat(extractJsonField(obj, "serialNumber"));
      let r : IncomeRecord = {
        id = id;
        serialNumber = serial;
        date = extractJsonField(obj, "date");
        category = extractJsonField(obj, "category");
        donorName = extractJsonField(obj, "donorName");
        donorAddress = extractJsonField(obj, "donorAddress");
        mobile = extractJsonField(obj, "mobile");
        amount = parseFloat(extractJsonField(obj, "amount"));
        designation = extractJsonField(obj, "designation");
      };
      incomeRecords.add(id, r);
      incomeCount += 1;
      if (id >= maxIncomeId) { maxIncomeId := id + 1 };
      if (serial >= maxIncomeSerial) { maxIncomeSerial := serial + 1 };
    };
    if (incomeCount > 0) {
      nextIncomeId := maxIncomeId;
      nextIncomeSerial := maxIncomeSerial;
    };

    // Parse and import expense records
    let expenseJson = extractJsonArray(jsonData, "expenseRecords");
    let expenseObjs = splitJsonObjects(expenseJson);
    expenseRecords.clear();
    var expenseCount = 0;
    var maxExpenseId : Nat = 0;
    var maxExpenseSerial : Nat = 0;
    for (obj in expenseObjs.vals()) {
      let id = parseNat(extractJsonField(obj, "id"));
      let serial = parseNat(extractJsonField(obj, "serialNumber"));
      let r : ExpenseRecord = {
        id = id;
        serialNumber = serial;
        date = extractJsonField(obj, "date");
        category = extractJsonField(obj, "category");
        recipientName = extractJsonField(obj, "recipientName");
        recipientAddress = extractJsonField(obj, "recipientAddress");
        mobile = extractJsonField(obj, "mobile");
        amount = parseFloat(extractJsonField(obj, "amount"));
        proofFileId = extractJsonField(obj, "proofFileId");
      };
      expenseRecords.add(id, r);
      expenseCount += 1;
      if (id >= maxExpenseId) { maxExpenseId := id + 1 };
      if (serial >= maxExpenseSerial) { maxExpenseSerial := serial + 1 };
    };
    if (expenseCount > 0) {
      nextExpenseId := maxExpenseId;
      nextExpenseSerial := maxExpenseSerial;
    };

    // Parse and import expense categories
    let categoriesJson = extractJsonArray(jsonData, "expenseCategories");
    let categoryObjs = splitJsonObjects(categoriesJson);
    expenseCategories.clear();
    var categoryCount = 0;
    var maxCategoryId : Nat = 0;
    for (obj in categoryObjs.vals()) {
      let id = parseNat(extractJsonField(obj, "id"));
      let c : ExpenseCategory = {
        id = id;
        name = extractJsonField(obj, "name");
      };
      expenseCategories.add(id, c);
      categoryCount += 1;
      if (id >= maxCategoryId) { maxCategoryId := id + 1 };
    };
    if (categoryCount > 0) { nextCategoryId := maxCategoryId };

    // Parse and import notices
    let noticesJson = extractJsonArray(jsonData, "notices");
    let noticeObjs = splitJsonObjects(noticesJson);
    noticeRecords.clear();
    var noticeCount = 0;
    var maxNoticeId : Nat = 0;
    for (obj in noticeObjs.vals()) {
      let id = parseNat(extractJsonField(obj, "id"));
      let n : NoticeRecord = {
        id = id;
        date = extractJsonField(obj, "date");
        noticeNo = extractJsonField(obj, "noticeNo");
        title = extractJsonField(obj, "title");
        body = extractJsonField(obj, "body");
        authority = extractJsonField(obj, "authority");
        savedAt = extractJsonField(obj, "savedAt");
      };
      noticeRecords.add(id, n);
      noticeCount += 1;
      if (id >= maxNoticeId) { maxNoticeId := id + 1 };
    };
    if (noticeCount > 0) { nextNoticeId := maxNoticeId };

    // Parse and import resolutions
    let resolutionsJson = extractJsonArray(jsonData, "resolutions");
    let resolutionObjs = splitJsonObjects(resolutionsJson);
    resolutionRecords.clear();
    var resolutionCount = 0;
    var maxResolutionId : Nat = 0;
    for (obj in resolutionObjs.vals()) {
      let id = parseNat(extractJsonField(obj, "id"));
      let r : ResolutionRecord = {
        id = id;
        date = extractJsonField(obj, "date");
        resNo = extractJsonField(obj, "resNo");
        meetingType = extractJsonField(obj, "meetingType");
        venue = extractJsonField(obj, "venue");
        presiding = extractJsonField(obj, "presiding");
        attendees = extractJsonField(obj, "attendees");
        resolutions = extractJsonField(obj, "resolutions");
        secretary = extractJsonField(obj, "secretary");
        savedAt = extractJsonField(obj, "savedAt");
      };
      resolutionRecords.add(id, r);
      resolutionCount += 1;
      if (id >= maxResolutionId) { maxResolutionId := id + 1 };
    };
    if (resolutionCount > 0) { nextResolutionId := maxResolutionId };

    // Parse and import family nodes
    let nodesJson = extractJsonArray(jsonData, "familyNodes");
    let nodeObjs = splitJsonObjects(nodesJson);
    familyNodes.clear();
    var nodeCount = 0;
    for (obj in nodeObjs.vals()) {
      let id = extractJsonField(obj, "id");
      let parentRaw = extractJsonField(obj, "parentId");
      let n : FamilyNode = {
        id = id;
        name = extractJsonField(obj, "name");
        parentId = parseOptText(parentRaw);
        generationLevel = parseNat(extractJsonField(obj, "generationLevel"));
      };
      familyNodes.add(id, n);
      nodeCount += 1;
    };

    let counts =
      "members=" # memberCount.toText() #
      ",chapters=" # chapterCount.toText() #
      ",income=" # incomeCount.toText() #
      ",expenses=" # expenseCount.toText() #
      ",categories=" # categoryCount.toText() #
      ",notices=" # noticeCount.toText() #
      ",resolutions=" # resolutionCount.toText() #
      ",familyNodes=" # nodeCount.toText();

    { success = true; message = "Import successful"; counts = counts };
  };
};
