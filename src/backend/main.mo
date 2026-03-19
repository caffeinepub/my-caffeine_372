import Map "mo:core/Map";
import Set "mo:core/Set";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

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

  // ---- Legacy stable vars kept for upgrade compatibility (unused) ----
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
  type LegacyUserProfile = { name : Text };

  // Kept to satisfy upgrade compatibility (not used in new logic)
  let members = Map.empty<Principal, LegacyMember>();
  let donations = Map.empty<Nat, LegacyDonation>();
  let events = Map.empty<Nat, LegacyEvent>();
  let projects = Map.empty<Nat, LegacyProject>();
  let userProfiles = Map.empty<Principal, LegacyUserProfile>();
  var nextDonationId : Nat = 0;
  var nextEventId : Nat = 0;
  var nextProjectId : Nat = 0;
  // ---- End legacy vars ----

  var nextId : Nat = 0;
  var nextSerial : Nat = 1;
  let councilMembers = Map.empty<Nat, CouncilMember>();

  // Authorization state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public query ({ caller }) func getNextSerialNumber() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    nextSerial;
  };

  public query ({ caller }) func getAllMembers() : async [CouncilMember] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    councilMembers.values().toArray();
  };

  public query ({ caller }) func getMembersByCouncil(council : Council) : async [CouncilMember] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
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
}
