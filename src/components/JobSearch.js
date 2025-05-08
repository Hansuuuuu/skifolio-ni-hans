import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, getDocs, doc, getDoc, setDoc, deleteDoc, Timestamp, addDoc } from "firebase/firestore";
import { serverTimestamp } from "firebase/firestore";

const JobSearch = () => {
    const [jobs, setJobs] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [expandedJob, setExpandedJob] = useState(null);
    const [employerDetails, setEmployerDetails] = useState(null);
    const [userAverage, setUserAverage] = useState(null);
    const [appliedJobs, setAppliedJobs] = useState(new Set()); // Track applied jobs
    const [sortOrder, setSortOrder] = useState("ascending");
    const [sortType, setSortType] = useState("date");
    
    // New state for reporting feature
    const [showReportForm, setShowReportForm] = useState(false);
    const [reportReason, setReportReason] = useState("");
    const [reportDetails, setReportDetails] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
  
    useEffect(() => {
      const fetchUserAverageScore = async () => {
        if (auth.currentUser) {
          const userRef = doc(db, "applicants", auth.currentUser.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setUserAverage(parseFloat(userSnap.data().skills?.average || 0));
          }
        }
      };
  
      const fetchJobs = async () => {
        const jobsCollection = collection(db, "jobs");
        const jobSnapshot = await getDocs(jobsCollection);
      
        const jobList = jobSnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
            averageScore: parseFloat(doc.data().averageScore || 0),
          }))
          .filter((job) => job.status?.toLowerCase() !== "closed"); // Filter out closed jobs
      
        setJobs(jobList);
        setFilteredJobs(jobList);
      };
  
      fetchUserAverageScore();
      fetchJobs();
      fetchAppliedJobs();
    }, []);
  
    const fetchAppliedJobs = async () => {
      if (auth.currentUser) {
        const userId = auth.currentUser.uid;
        const jobsRef = collection(db, "jobs");
        const jobSnapshot = await getDocs(jobsRef);
        const appliedJobIds = new Set();
  
        for (const jobDoc of jobSnapshot.docs) {
          const applicationsRef = collection(db, "jobs", jobDoc.id, "applications");
          const applicationSnapshot = await getDocs(applicationsRef);
          if (applicationSnapshot.docs.some((doc) => doc.id === userId)) {
            appliedJobIds.add(jobDoc.id);
          }
        }
  
        setAppliedJobs(appliedJobIds);
      }
    };
    
    const notifyEmployerOfNewApplicant = async (employerUid, jobTitle, applicantName) => {
      const notifRef = collection(db, "employers", employerUid, "notifications");
    
      await addDoc(notifRef, {
        subject: "New Job Application",
        message: `${applicantName} applied for your job posting: ${jobTitle}.`,
        status: "unread",
        timestamp: serverTimestamp(),
      });
    };
    
    useEffect(() => {
      if (expandedJob && expandedJob.employerId) {
        const fetchEmployerDetails = async () => {
          try {
            const employerRef = doc(db, "employers", expandedJob.employerId);
            const employerSnap = await getDoc(employerRef);
            setEmployerDetails(employerSnap.exists() ? employerSnap.data() : null);
          } catch (error) {
            console.error("Error fetching employer details:", error);
            setEmployerDetails(null);
          }
        };
        fetchEmployerDetails();
      } else {
        setEmployerDetails(null);
      }
    }, [expandedJob]);
  
    const handleSearch = (e) => {
      setSearchTerm(e.target.value);
      const filtered = jobs.filter((job) => {
        // Convert search term to lowercase for case-insensitive comparison
        const searchTerm = e.target.value.toLowerCase();
        
        // Safely check each property exists before using toLowerCase()
        const titleMatch = job.title ? job.title.toLowerCase().includes(searchTerm) : false;
        const descMatch = job.description ? job.description.toLowerCase().includes(searchTerm) : false;
        const companyMatch = job.companyName ? job.companyName.toLowerCase().includes(searchTerm) : false;
        const locationMatch = job.location ? job.location.toLowerCase().includes(searchTerm) : false;
        const roleMatch = job.jobRole ? job.jobRole.toLowerCase().includes(searchTerm) : false;
        // Return true if any field matches the search term
        return titleMatch || descMatch || companyMatch || locationMatch || roleMatch;
      });
      setFilteredJobs(filtered);
    };
  
    const handleSort = () => {
      let sortedJobs = [...filteredJobs];
  
      if (sortType === "title") {
        sortedJobs.sort((a, b) =>
          sortOrder === "ascending" ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)
        );
      } 
      else if (sortType === "date") {
        sortedJobs.sort((a, b) => {
          // Convert Firebase Timestamp to JS time in milliseconds
          const dateA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0;
          const dateB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0;
      
          return sortOrder === "ascending" ? dateA - dateB : dateB - dateA;
        });
      }
      
      else if (sortType === "role") {
        // Define the order of job roles for sorting
        const roleOrder = [
          "Front-end Developer", 
          "Back-end Developer", 
          "Full Stack Developer",
          "React Developer", 
          "Vue.js Developer", 
          "Angular Developer",
          "Node.js Developer", 
          "Django Developer", 
          "Laravel Developer",
          "Express.js Developer", 
          "JavaScript Engineer", 
          "TypeScript Developer",
          "Next.js Developer", 
          "Nuxt.js Developer", 
          "API Developer"
        ];
        
        sortedJobs.sort((a, b) => {
          // Get the index of each job role in our predefined order
          const indexA = roleOrder.indexOf(a.title);
          const indexB = roleOrder.indexOf(b.title);
          
          // If the role isn't in our list, put it at the end
          const valueA = indexA === -1 ? roleOrder.length : indexA;
          const valueB = indexB === -1 ? roleOrder.length : indexB;
          
          // Return the comparison based on sortOrder
          return sortOrder === "ascending" ? valueA - valueB : valueB - valueA;
        });
      }
      
      setFilteredJobs(sortedJobs);
    };
  
    const highestEligibleJobs = filteredJobs.filter((job) => userAverage !== null && userAverage >= job.averageScore);
  
    const handleApply = async (jobId, jobTitle, e) => {
      e.stopPropagation();
      if (!auth.currentUser) return;
    
      try {
        const userId = auth.currentUser.uid;
        const userRef = doc(db, "applicants", userId);
        const userSnap = await getDoc(userRef);
    
        if (!userSnap.exists()) {
          console.error("User data not found!");
          return;
        }
    
        const userData = userSnap.data();
        const { name, certifications = [], githubRepo, email } = userData;
    
        // Get submissions
        const submissionsRef = collection(db, "applicants", userId, "submissions");
        const submissionSnapshot = await getDocs(submissionsRef);
        const submissions = submissionSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    
        // Apply to job
        const applicationRef = doc(db, "jobs", jobId, "applications", userId);
        const applicationData = {
          userId,
          jobId,
          appliedAt: Timestamp.now(),
          name,
          certifications,
          githubRepo,
          email,
          submissions,
        };
    
        await setDoc(applicationRef, applicationData);
    
        // Get the job document to find its companyName
        const jobDoc = await getDoc(doc(db, "jobs", jobId));
        if (!jobDoc.exists()) {
          console.error("Job not found!");
          return;
        }
    
        const jobData = jobDoc.data();
        const companyName = jobData.companyName;
        const jobRole = jobData.jobRole;
        // Search all employers for matching companyName
        const employersSnapshot = await getDocs(collection(db, "employers"));
        const matchingEmployer = employersSnapshot.docs.find(
          (doc) => doc.data().companyName === companyName,
          (doc) => doc.data().jobRole === jobRole
        );
    
        if (matchingEmployer) {
          const employerUid = matchingEmployer.id;
    
          // Notify the employer
          await notifyEmployerOfNewApplicant(employerUid, jobTitle, name);
        } else {
          console.warn("No matching employer found for company:", companyName);
        }
    
        await fetchAppliedJobs(); // Refresh applied jobs
        alert("Applied to job: " + jobTitle);
      } catch (error) {
        console.error("Error applying to job:", error);
      }
    };
    
    const handleCancelApplication = async (jobId, e) => {
      e.stopPropagation();
      if (auth.currentUser) {
        try {
          const userId = auth.currentUser.uid;
          const applicationRef = doc(db, "jobs", jobId, "applications", userId);
          await deleteDoc(applicationRef);
  
          await fetchAppliedJobs(); // Refresh applied jobs
  
          alert("Application canceled.");
        } catch (error) {
          console.error("Error canceling application:", error);
        }
      }
    };
    
    // New function to handle job reporting
    const handleReportJob = async (e) => {
      e.preventDefault();
      
      if (!auth.currentUser) {
        alert("You must be logged in to report jobs.");
        return;
      }
      
      if (!reportReason) {
        alert("Please select a reason for reporting this job.");
        return;
      }
      
      if (!reportDetails || reportDetails.trim().length < 10) {
        alert("Please provide more details about the violation.");
        return;
      }
      
      setIsSubmitting(true);
      
      try {
        const userId = auth.currentUser.uid;
        const userRef = doc(db, "applicants", userId);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
          alert("User profile not found!");
          setIsSubmitting(false);
          return;
        }
        
        const userData = userSnap.data();
        
        // Create the report in a new collection
        const reportsRef = collection(db, "job_reports");
        await addDoc(reportsRef, {
          jobId: expandedJob.id,
          jobTitle: expandedJob.title,
          companyName: expandedJob.companyName,
          employerId: expandedJob.employerId,
          reportedBy: userId,
          reporterName: userData.name || "Anonymous User",
          reporterEmail: userData.email || "No email provided",
          reason: reportReason,
          details: reportDetails,
          status: "pending", // pending, reviewed, resolved
          createdAt: serverTimestamp(),
        });
        
        // Also create a subcollection of reports within the job document
        const jobReportRef = collection(db, "jobs", expandedJob.id, "reports");
        await addDoc(jobReportRef, {
          reportedBy: userId,
          reason: reportReason,
          details: reportDetails,
          status: "pending",
          createdAt: serverTimestamp(),
        });
        
        // Notify admin about the report
        const adminNotificationsRef = collection(db, "admin_notifications");
        await addDoc(adminNotificationsRef, {
          type: "job_report",
          jobId: expandedJob.id,
          jobTitle: expandedJob.title,
          companyName: expandedJob.companyName,
          reportReason: reportReason,
          reportedAt: serverTimestamp(),
          status: "unread",
        });
        
        alert("Thank you for your report. Our team will review it shortly.");
        setShowReportForm(false);
        setReportReason("");
        setReportDetails("");
      } catch (error) {
        console.error("Error submitting job report:", error);
        alert("There was an error submitting your report. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    };
    
    // Function to toggle report form
    const toggleReportForm = (e) => {
      e.stopPropagation();
      setShowReportForm(!showReportForm);
    };
    
    // Report form JSX
    const reportForm = (
      <div 
        style={{
          marginTop: "20px",
          padding: "16px",
          border: "1px solid #eee",
          borderRadius: "8px",
          backgroundColor: "#f9f9f9",
        }}
      >
        <h3 style={{ marginTop: 0, color: "#d32f2f" }}>Report Job Listing</h3>
        <form onSubmit={handleReportJob}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
              Reason for Report:*
            </label>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "4px",
                border: "1px solid #ddd",
              }}
              required
            >
              <option value="">-- Select a reason --</option>
              <option value="Discriminatory content">Discriminatory content</option>
              <option value="Misleading information">Misleading information</option>
              <option value="Inappropriate salary/compensation">Inappropriate salary/compensation</option>
              <option value="Scam/Fraud">Scam or fraudulent posting</option>
              <option value="Duplicate posting">Duplicate posting</option>
              <option value="Unprofessional language">Unprofessional language</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
              Details:*
            </label>
            <textarea
              value={reportDetails}
              onChange={(e) => setReportDetails(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "4px",
                border: "1px solid #ddd",
                minHeight: "100px",
                resize: "vertical",
              }}
              placeholder="Please provide specific details about the violation..."
              required
            />
          </div>
          
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                backgroundColor: "#d32f2f",
                color: "#fff",
                padding: "10px 16px",
                borderRadius: "4px",
                border: "none",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                opacity: isSubmitting ? 0.7 : 1,
              }}
            >
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </button>
            
            <button
              type="button"
              onClick={toggleReportForm}
              style={{
                backgroundColor: "#757575",
                color: "#fff",
                padding: "10px 16px",
                borderRadius: "4px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );

  return (
    <div style={{ position: "relative" }}>
      <div
        id="job-search-container"
        style={{
          padding: "20px",
          transition: "filter 0.3s ease-in-out",
        }}
      >
        <h2 style={{ marginTop: "25px" }}>Search Jobs</h2>
        <input
          type="text"
          placeholder="Search for jobs..."
          value={searchTerm}
          onChange={handleSearch}
          style={{
            marginBottom: "20px",
            marginTop: "20px",
            width: "100%",
            padding: "10px",
            borderRadius: "5px",
            border: "1px solid #ddd",
          }}
        />

        <div>
          <button
            onClick={() => {
              setSortOrder((prevOrder) =>
                prevOrder === "ascending" ? "descending" : "ascending"
              );
              handleSort();
            }}
            style={{
              padding: "8px 16px",
              fontSize: "16px",
              backgroundColor: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              marginBottom: "20px",
              marginRight: "10px",
            }}
          >
            Sort by {sortOrder === "ascending" ? "Descending" : "Ascending"}
          </button>

          <select
            onChange={(e) => {
              setSortType(e.target.value);
              handleSort();
            }}
            value={sortType}
            style={{
              padding: "8px 16px",
              fontSize: "16px",
              borderRadius: "5px",
              border: "1px solid #ddd",
              marginBottom: "20px",
              backgroundColor: "#fff",
            }}
          >
            <option value="date">Sort by Date</option>
            <option value="title">Sort by Title</option>
          </select>

          <h3>Highest Eligible Jobs</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
            {highestEligibleJobs.map((job) => (
              <div
                key={job.id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  boxShadow: "0 0 10px black",
                  padding: "10px",
                  width: "200px",
                  cursor: "pointer",
                  background: "#a6faf6",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                }}
                onClick={() => setExpandedJob(job)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.05)";
                  e.currentTarget.style.boxShadow =
                    "0 0 15px rgba(0, 0, 0, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "0 0 10px black";
                }}
              >
                <h4>{job.title}</h4>
                <p>
                  <strong>Company:</strong> {job.companyName}
                </p>
                <p>
                  <strong>JobRole:</strong> {job.jobRole}
                </p>
                <p>
                  <strong>Location:</strong> {job.location}
                </p>
              </div>
            ))}
          </div>

          <h3>All Jobs</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  boxShadow: "0 0 10px black",
                  padding: "10px",
                  width: "200px",
                  cursor: "pointer",
                  background: "#a6faf6",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                }}
                onClick={() => setExpandedJob(job)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.05)";
                  e.currentTarget.style.boxShadow =
                    "0 0 15px rgba(0, 0, 0, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "0 0 10px black";
                }}
              >
              <div className="job-posting">
                <h4>{job.title}</h4>
                <p><strong>Company:</strong> {job.companyName}</p>
                <p><strong>Job Role:</strong> {job.jobRole}</p>
                <p><strong>Location:</strong> {job.location}</p>
              </div>
              </div>
            ))}
          </div>
        </div>

        {expandedJob && (
        <div
          style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "#fff",
          borderRadius: "12px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
          width: "80%",
          maxWidth: "80%",
          maxHeight: "80%",
          padding: "24px",
          zIndex: 1000,
          overflowY: "auto",
          animation: "fadeIn 0.3s ease",
          fontFamily: "sans-serif",
          }}
        >
          <h3>{expandedJob.title}</h3>
          <p><strong>Posted On:</strong> {new Date(expandedJob.createdAt.seconds * 1000).toLocaleDateString()}</p>
          <p><strong>Company:</strong> {expandedJob.companyName}</p>
          <p><strong>Role:</strong> {expandedJob.jobRole}</p>
          <p><strong>Location:</strong> {expandedJob.location}</p>
          <p><strong>Description:</strong> {expandedJob.description}</p>

          {employerDetails && (
            <div
              style={{
                  marginTop: "20px",
                  padding: "16px",
                  border: "1px solid #eee",
                  borderRadius: "8px",
                  backgroundColor: "#f9f9f9",
              }}
            >
               <h3 style={{ marginTop: 0 }}>Company Details</h3>
                <p><strong>Industry:</strong> {employerDetails.industry}</p>
                <p><strong>Location:</strong> {employerDetails.location}</p>
                <p><strong>About:</strong> {employerDetails.description}</p>

               <h3 style={{ marginTop: 0 }}>Contact Information</h3>
                <p><strong>Name:</strong> {employerDetails.contactPerson}</p>
                <p><strong>Email:</strong> {employerDetails.email}</p>
                <p><strong>Phone:</strong> {employerDetails.phone}</p>

              <div style={{ marginTop: "12px" }}>
                  <img
                    src={employerDetails.profilePic || "/default-profile.png"}
                    alt="Employer Profile"
                    style={{
                      width: "100px",
                      height: "100px",
                      borderRadius: "50%",
                      border: "2px solid #ccc",
                      objectFit: "cover",
                    }}
                  />
                </div>
              </div>
            )}
            
          {/* Report job feature */}
          {showReportForm ? (
            reportForm
          ) : (
            <button
              onClick={toggleReportForm}
              style={{
                backgroundColor: "#ff9800",
                color: "#fff",
                padding: "8px 14px",
                borderRadius: "4px",
                border: "none",
                cursor: "pointer",
                marginTop: "20px",
                display: "flex",
                alignItems: "center",
                fontSize: "14px",
              }}
            >
              <span style={{ marginRight: "6px" }}>⚠️</span> Report Job Listing
            </button>
          )}

          <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
            {appliedJobs.has(expandedJob.id) ? (
              <button
                onClick={(e) => handleCancelApplication(expandedJob.id, e)}
                style={{
                  backgroundColor: "red",
                  color: "white",
                  padding: "10px",
                  borderRadius: "5px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Cancel Application
              </button>
            ) : (
              <button
                onClick={(e) => handleApply(expandedJob.id, expandedJob.title, e)}
                style={{
                  backgroundColor: "#007bff",
                  color: "#fff",
                  padding: "10px",
                  borderRadius: "5px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Apply
              </button>
            )}

            <button 
              onClick={() => setExpandedJob(null)} 
              style={{ 
                padding: "10px", 
                borderRadius: "5px", 
                border: "1px solid #ddd",
                backgroundColor: "#007bff",
                cursor: "pointer", 
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default JobSearch;