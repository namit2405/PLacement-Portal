import Text "mo:core/Text";
import Int "mo:core/Int";
import List "mo:core/List";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Custom role system for the application
  type AppRole = {
    #student;
    #recruiter;
    #admin;
  };

  type StudentProfile = {
    name : Text;
    email : Text;
    gpa : Float;
    skills : [Text];
    resumeUrl : Text;
    graduationYear : Nat;
  };

  type JobPosting = {
    title : Text;
    company : Text;
    description : Text;
    requirements : [Text];
    jobType : { #job; #internship };
    location : Text;
    stipendOrSalary : Text;
    deadline : Int;
    postedBy : Principal;
  };

  type ApplicationStatus = {
    #pending;
    #shortlisted;
    #rejected;
    #selected;
  };

  type JobApplication = {
    student : Principal;
    jobId : Nat;
    status : ApplicationStatus;
    appliedAt : Int;
  };

  type Stats = {
    totalStudents : Nat;
    totalJobs : Nat;
    totalApplications : Nat;
    placements : Nat;
  };

  let studentProfiles = Map.empty<Principal, StudentProfile>();
  let appRoles = Map.empty<Principal, AppRole>();
  let jobs = Map.empty<Nat, JobPosting>();
  let applications = Map.empty<Nat, JobApplication>();

  var nextJobId = 1;
  var nextApplicationId = 1;

  // Helper functions for role management
  func getAppRole(user : Principal) : ?AppRole {
    appRoles.get(user);
  };

  func isStudent(user : Principal) : Bool {
    switch (appRoles.get(user)) {
      case (?#student) { true };
      case (_) { false };
    };
  };

  func isRecruiter(user : Principal) : Bool {
    switch (appRoles.get(user)) {
      case (?#recruiter) { true };
      case (_) { false };
    };
  };

  func isAppAdmin(user : Principal) : Bool {
    switch (appRoles.get(user)) {
      case (?#admin) { true };
      case (_) { false };
    };
  };

  func requireStudent(caller : Principal) {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be authenticated");
    };
    if (not isStudent(caller)) {
      Runtime.trap("Unauthorized: Only students can perform this action");
    };
  };

  func requireRecruiter(caller : Principal) {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be authenticated");
    };
    if (not isRecruiter(caller)) {
      Runtime.trap("Unauthorized: Only recruiters can perform this action");
    };
  };

  func requireAppAdmin(caller : Principal) {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be authenticated");
    };
    if (not isAppAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
  };

  func requireRecruiterOrAdmin(caller : Principal) {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be authenticated");
    };
    if (not isRecruiter(caller) and not isAppAdmin(caller)) {
      Runtime.trap("Unauthorized: Only recruiters or admins can perform this action");
    };
  };

  // Role assignment (admin only via base access control)
  public shared ({ caller }) func assignAppRole(user : Principal, role : AppRole) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can assign roles");
    };
    appRoles.add(user, role);
  };

  public query ({ caller }) func getMyAppRole() : async ?AppRole {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be authenticated");
    };
    appRoles.get(caller);
  };

  // Student profile management
  public shared ({ caller }) func saveCallerUserProfile(profile : StudentProfile) : async () {
    requireStudent(caller);
    studentProfiles.add(caller, profile);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?StudentProfile {
    requireStudent(caller);
    studentProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?StudentProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be authenticated");
    };
    if (not Principal.equal(caller, user) and not isAppAdmin(caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile unless you are an admin");
    };
    studentProfiles.get(user);
  };

  // Job posting management
  public shared ({ caller }) func postJob(job : JobPosting) : async Nat {
    requireRecruiter(caller);
    if (Text.equal(job.company, "")) {
      Runtime.trap("Company name cannot be empty");
    };
    let jobId = nextJobId;
    nextJobId += 1;

    let newJob : JobPosting = {
      job with
      deadline = job.deadline;
      postedBy = caller;
    };
    jobs.add(jobId, newJob);
    jobId;
  };

  public shared ({ caller }) func updateJob(jobId : Nat, job : JobPosting) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be authenticated");
    };
    let existingJob = getValidJobById(jobId);
    // Only the recruiter who posted the job or an admin can update it
    if (not Principal.equal(existingJob.postedBy, caller) and not isAppAdmin(caller)) {
      Runtime.trap("Unauthorized: Only the recruiter who posted this job or an admin can update it");
    };
    let updatedJob : JobPosting = {
      job with
      postedBy = existingJob.postedBy;
    };
    jobs.add(jobId, updatedJob);
  };

  public shared ({ caller }) func deleteJob(jobId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be authenticated");
    };
    let existingJob = getValidJobById(jobId);
    // Only the recruiter who posted the job or an admin can delete it
    if (not Principal.equal(existingJob.postedBy, caller) and not isAppAdmin(caller)) {
      Runtime.trap("Unauthorized: Only the recruiter who posted this job or an admin can delete it");
    };
    jobs.remove(jobId);
  };

  public query func getAllJobs() : async [JobPosting] {
    // Public access - anyone including guests can view all jobs
    jobs.values().toArray();
  };

  // Application management
  public shared ({ caller }) func applyToJob(jobId : Nat) : async Nat {
    requireStudent(caller);
    ignore getValidJobById(jobId);
    
    // Check if student already applied to this job
    for (app in applications.values()) {
      if (Principal.equal(app.student, caller) and app.jobId == jobId) {
        Runtime.trap("You have already applied to this job");
      };
    };

    let appId = nextApplicationId;
    nextApplicationId += 1;

    let application : JobApplication = {
      student = caller;
      jobId;
      status = #pending;
      appliedAt = Time.now();
    };

    applications.add(appId, application);
    appId;
  };

  public shared ({ caller }) func updateApplicationStatus(applicationId : Nat, newStatus : ApplicationStatus) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be authenticated");
    };
    let app = getValidApplicationById(applicationId);
    let job = getValidJobById(app.jobId);
    
    // Only the recruiter who posted the job or an admin can update application status
    if (not Principal.equal(job.postedBy, caller) and not isAppAdmin(caller)) {
      Runtime.trap("Unauthorized: Only the recruiter who posted this job or an admin can update application status");
    };

    let updatedApp = { app with status = newStatus };
    applications.add(applicationId, updatedApp);
  };

  public query ({ caller }) func getMyApplications() : async [JobApplication] {
    requireStudent(caller);
    applications.values().filter(func(app) { Principal.equal(app.student, caller) }).toArray();
  };

  public query ({ caller }) func getApplicationsForJob(jobId : Nat) : async [JobApplication] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be authenticated");
    };
    ignore getValidJobById(jobId);
    let job = getValidJobById(jobId);
    
    // Only the recruiter who posted the job or an admin can view applications
    if (not Principal.equal(job.postedBy, caller) and not isAppAdmin(caller)) {
      Runtime.trap("Unauthorized: Only the recruiter who posted this job or an admin can view applications");
    };

    applications.values().filter(func(app) { app.jobId == jobId }).toArray();
  };

  // Admin-only functions
  public query ({ caller }) func getAllStudents() : async [StudentProfile] {
    requireAppAdmin(caller);
    studentProfiles.values().toArray();
  };

  public query ({ caller }) func getAllApplications() : async [JobApplication] {
    requireAppAdmin(caller);
    applications.values().toArray();
  };

  public query ({ caller }) func getStats() : async Stats {
    requireAppAdmin(caller);
    let placements = applications.values().filter(func(app) {
      switch (app.status) {
        case (#selected) { true };
        case (_) { false };
      };
    }).toArray().size();

    {
      totalStudents = studentProfiles.size();
      totalJobs = jobs.size();
      totalApplications = applications.size();
      placements = placements;
    };
  };

  // Helper functions
  func getValidJobById(jobId : Nat) : JobPosting {
    switch (jobs.get(jobId)) {
      case (null) { Runtime.trap("Job with id does not exist") };
      case (?j) { j };
    };
  };

  func getValidApplicationById(appId : Nat) : JobApplication {
    switch (applications.get(appId)) {
      case (null) { Runtime.trap("Application with id does not exist") };
      case (?a) { a };
    };
  };

  // Seed data function (for demo purposes - should be restricted in production)
  public shared ({ caller }) func seedData() : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be authenticated");
    };

    // Assign roles for demo
    appRoles.add(caller, #student);

    let student1 : StudentProfile = {
      name = "Alice";
      email = "alice@student.university.edu";
      gpa = 3.8;
      skills = ["Java", "Python", "Teamwork"];
      resumeUrl = "ipfs://alice_resume.pdf";
      graduationYear = 2025;
    };
    studentProfiles.add(caller, student1);

    // For demo, also create a recruiter role and job
    let recruiterPrincipal = caller; // In real scenario, this would be different
    appRoles.add(recruiterPrincipal, #recruiter);

    let job1 : JobPosting = {
      title = "Software Engineer";
      company = "TechCorp";
      description = "Build cool stuff";
      requirements = ["Java", "OOP"];
      jobType = #job;
      location = "Remote";
      stipendOrSalary = "USD 80k/yr";
      deadline = 1735689600000;
      postedBy = recruiterPrincipal;
    };
    let jobId = nextJobId;
    nextJobId += 1;
    jobs.add(jobId, job1);
  };
};
