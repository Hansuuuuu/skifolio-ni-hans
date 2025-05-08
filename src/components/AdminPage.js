import React, { useState, useEffect } from "react";
import { db, storage } from "../firebase";
import { collection,collectionGroup, getDocs, getDoc, query, where } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import emailjs from "emailjs-com"; // or "@emailjs/browser" depending on your setup



import {
  deleteDoc,
  doc,
  addDoc,
} from "firebase/firestore";
import { writeBatch } from "firebase/firestore"; // Import writeBatch
import { setDoc} from "firebase/firestore";
const AdminPage = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isApplicant, setIsApplicant] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [employers, setEmployers] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedUserType, setSelectedUserType] = useState("Applicants");
  const [selectedUser, setSelectedUser] = useState(null);
  const [employerJobs, setEmployerJobs] = useState([]);
  const [jobApplicants, setJobApplicants] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [selectedHiredApplicant, setSelectedHiredApplicant] = useState(null);
  const [pendingJobs, setPendingJobs] = useState([]);
  const [isUserClassVisible, setIsUserClassVisible] = useState(true)
  const [isUserApproval, setUserApproval] = useState(true)
  const [historyVisible, setHistoryVisible] = useState(true);
  const [historyData, setHistoryData] = useState([]);
  const [sendNotif, setSendNotification] =  useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [recipientType, setRecipientType] = useState(null);
  const [imageFile, setImageFile] = useState(null); // Define the state for the image file
  const [showDashboard, setShowDashboard] = useState(true); // Show Dashboard by default
  const [hiredJobData, setHiredJobData] = useState([]);
  const [showhired, showHiredJobData] = useState(false);

  // const [announcements, setAnnouncements] = useState([]);
  // const [newAnnouncement, setNewAnnouncement] = useState('');
  const [activeTab, setActiveTab] = useState('manageUsers');
  const [viewingHired, setViewingHired] = useState(false);
  const [applicantshow,setShowApplicant] = useState([]);
  const [viewingReport, setViewingReport] = useState(false);
  const [reportShow,setShowReport] = useState([]);
  const [hasFetchedReports, setHasFetchedReports] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [hiredJobs, setHiredJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  // Function to add history record with a timestamp
  
  useEffect(() => {
    console.log("Selected User in useEffect:", selectedUser);
    
    const fetchUserApplications = async () => {
      if (!selectedUser?.id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Known user ID in the applications - this is the ID found in your database
        const knownApplicationUserId = 'jj1fycYHTZagTgRa30fiFey2wTE3';
        
        console.log(`Fetching applications for user ID ${selectedUser.id} or ${knownApplicationUserId}`);
        
        const jobsSnapshot = await getDocs(collection(db, "jobs"));
        const tempAppliedJobs = [];
        const tempHiredJobs = [];
    
        for (const jobDoc of jobsSnapshot.docs) {
          const jobData = jobDoc.data();
          const applicationsRef = collection(db, "jobs", jobDoc.id, "applications");
          const applicationsSnap = await getDocs(applicationsRef);
    
          applicationsSnap.forEach((appDoc) => {
            const appData = appDoc.data();
            
            // Debug: Log the status value
            console.log(`Application for job ${jobDoc.id} by user ${appData.userId} has status: "${appData.status}"`);
  
            // Check if the application belongs to either the selected user OR the known user ID
            if (appData.userId === selectedUser.id || appData.userId === knownApplicationUserId) {
              const jobInfo = {
                id: jobDoc.id,
                title: jobData.title || "Untitled Job",
                location: jobData.location || "No location specified",
                appliedAt: appData.appliedAt,
                status: appData.status,
                // Add this to show which user ID the application belongs to
                applicantId: appData.userId,
              };
            
              // More flexible condition to check for hired status
              if (appData.status && 
                  (appData.status.toLowerCase().trim() === "hired" || 
                   appData.status.toLowerCase().trim() === "accepted" ||
                   appData.status.toLowerCase().trim() === "completed")) {
                tempHiredJobs.push(jobInfo);
              } else {
                tempAppliedJobs.push(jobInfo);
              }
            }
          });
        }
        
        console.log("Applied jobs found:", tempAppliedJobs.length);
        console.log("Hired jobs found:", tempHiredJobs.length);
        console.log("Applied jobs details:", tempAppliedJobs);
        console.log("Hired jobs details:", tempHiredJobs);
        
        setAppliedJobs(tempAppliedJobs);
        setHiredJobs(tempHiredJobs);
      } catch (error) {
        console.error("Error fetching user applications:", error);
        setError("Failed to load job applications. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchUserApplications();
  }, [selectedUser]);
  
  
  const addHistoryRecord = async (event, details) => {
    const timestamp = new Date().toISOString(); // Get current timestamp
    setHistoryData((prevHistory) => [
      ...prevHistory,
      { timestamp, event, details },
    ]);


    try {
      // Add the new record to Firestore
      const historyDocRef = await addDoc(collection(db, "historyData"), {
        timestamp,
        event,
        details,
      });
    } catch (error) {
      console.error("Error adding history record: ", error);
    }
  };
  useEffect(() => {
    if (selectedUserType === "Report" && !hasFetchedReports) {
      const fetchReports = async () => {
        try {
          const querySnapshot = await getDocs(collection(db, "job_reports"));
          const reports = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          setShowReport(reports);
          setHasFetchedReports(true);
        } catch (error) {
          console.error("Error fetching reports:", error);
        }
      };

      fetchReports();
    }
  }, [selectedUserType, hasFetchedReports]);
  // Fetch applicants and employers from Firestore
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Fetch applicants
        const applicantsSnapshot = await getDocs(collection(db, "applicants"));
        const applicantsData = applicantsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));


        // Fetch employers
        const employersSnapshot = await getDocs(collection(db, "employers"));
        const employersData = employersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));


        setApplicants(applicantsData);
        setEmployers(employersData);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };


    fetchUsers();
  }, []);


  // Fetch Applicants
  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        const applicantsSnapshot = await getDocs(collection(db, "applicants"));
        const applicantsData = await Promise.all(
          applicantsSnapshot.docs.map(async (doc) => {
            const userId = doc.id;
            const applicantData = doc.data();


            // Fetch submissions
            const submissionsRef = collection(db, "applicants", userId, "submissions");
            const submissionsSnapshot = await getDocs(submissionsRef);
            const submissions = submissionsSnapshot.docs.map((subDoc) => subDoc.data());


            // Fetch applied jobs
            const appliedJobsRef = collection(db, "applicants", userId, "appliedJobs");
            const appliedJobsSnapshot = await getDocs(appliedJobsRef);
            const appliedJobs = appliedJobsSnapshot.docs.map((jobDoc) => jobDoc.data());
            
            return {
              ...applicantData,
              userId,
              submissions,
              appliedJobs,
            };
          })
        );
        setApplicants(applicantsData);
      } catch (error) {
        console.error("Error fetching applicants:", error);
      }
    };


    fetchApplicants();
  }, []);


  useEffect(() => {
    const fetchHiredApplicants = async () => {
      try {
        const employerSnapshot = await getDocs(collection(db, "employers"));
        const employerData = await Promise.all(
          employerSnapshot.docs.map(async (doc) => {
            const userId = doc.id;
            const employerData = doc.data();


            // Fetch submissions
            const hiredRef = collection(db, "employers", userId, "hired");
            const hiredSnapshot = await getDocs(hiredRef);
            const hired = hiredSnapshot.docs.map((subDoc) => subDoc.data());
            
            return {
              ...employerData,
              userId,
              hired,
            };
          })
        );
        setApplicants(employerData);
      } catch (error) {
        console.error("Error fetching applicants:", error);
      }
    };


    fetchHiredApplicants();
  }, []);
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const jobsSnapshot = await getDocs(collection(db, "jobs"));
        const allJobs = jobsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setJobs(allJobs);
        console.log("Fetched all jobs:", allJobs.length); // Debugging
      } catch (error) {
        console.error("Error fetching all jobs:", error);
      }
    };

    fetchJobs(); // Call the function
  }, []);
  useEffect(() => {
    const fetchPendingJobs = async () => {
      try {
        const jobsSnapshot = await getDocs(collection(db, "jobs-to-be-approved"));
        const jobsData = jobsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPendingJobs(jobsData);
      } catch (error) {
        console.error("Error fetching pending jobs:", error);
      }
    };


    fetchPendingJobs();
  }, []);


  const handleToggleClass = () => {
    setIsUserClassVisible(true);
    setUserApproval(false);
    setHistoryVisible(false);
    setShowAnnouncement(false);
  };


  const handleToggleApproval = () => {
    setUserApproval(true);
  };
  // Fetch Users to Approve
const [usersToApprove, setUsersToApprove] = useState([]);
const [deletedFiles, setDeletedFiles] = useState([]);
const [showDeletedFiles, setShowDeletedFiles] = useState(false); // Toggle for deleted files view
const [announcementVisible, setShowAnnouncement] = useState(false);


const [currentDateTime, setCurrentDateTime] = useState(new Date());
const [hoverTotalUsers, setHoverTotalUsers] = useState(false);


useEffect(() => {
  const interval = setInterval(() => {
    setCurrentDateTime(new Date());
  }, 1000); // update every second


  return () => clearInterval(interval); // clean up  
},[]);


{/** Dashboard Card*/}
const cardStyle = {
  backgroundColor: "#fff",
  padding: "20px",
  borderRadius: "8px",
  boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
  textAlign: "center",
  minWidth: "200px",
  flex: "1",
  transition: "transform 0.2s",
  cursor: "pointer",
};


useEffect(() => {
    const fetchUsersToApprove = async () => {
        try {
            const snapshot = await getDocs(collection(db, "userAccountsToBeApproved"));
            const users = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setUsersToApprove(users);
        } catch (error) {
            console.error("Error fetching users to approve:", error);
        }
    };


    fetchUsersToApprove();
}, [showDeletedFiles]);


useEffect(() => {
  const fetchUsersToApprove = async () => {
    try {
      const snapshot = await getDocs(collection(db, "userAccountsToBeApproved"));
      const users = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUsersToApprove(users);
    } catch (error) {
      console.error("Error fetching users to approve:", error);
    }
  };
  const fetchDeletedFiles = async () => {
    try {
        const snapshot = await getDocs(collection(db, "deletedFiles"));
        const files = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setDeletedFiles(files);
    } catch (error) {
        console.error("Error fetching deleted files:", error);
    }
};
if (showDeletedFiles) fetchDeletedFiles();
  fetchUsersToApprove();
}, [showDeletedFiles]); 


// useEffect(() => {
//   const fetchHistoryData = async () => {
//     try {
//       const snapshot = await getDocs(collection(db, "historyData"));
//       const history = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
//       setHistoryData(history);
//     } catch (error) {
//         console.error("Error fetching history data: ",error);
//     }
//   };
//   if (historyVisible) fetchHistoryData();
// }, [historyVisible]);
useEffect(() =>{
const fetchHistoryData = async () => {
  try {
    const snapshot = await getDocs(collection(db, "historyData"));
    const history = snapshot.docs.map((doc) => {
      const data = doc.data();
      const timestamp = data.timestamp; // Assuming your field is named 'timestamp'
      if (timestamp) {
        data.timestamp = timestamp.toDate().toLocaleString(); // Convert timestamp to readable date
      }
      return { id: doc.id, ...data };
    });
    setHistoryData(history);
  } catch (error) {
    console.error("Error fetching history data: ", error);
  }
};
if (historyVisible) fetchHistoryData();
}, [historyVisible]);


// Approve User
const handleApproveUser = async (user) => {
  
  try {
    console.log("handleApproveUser received user:", user);
console.log("Email:", user.email);

    // Prepare email template parameters
    emailjs.init("bWFWZMuU0I3Ok35gl"); // Replace with your actual EmailJS public key
    const templateParams = {
      email: user.email,
      html: `
        <div style="font-family: system-ui, sans-serif, Arial; font-size: 16px; background-color: #fff8f1">
          <div style="max-width: 600px; margin: auto; padding: 16px">
            <p>Welcome to the Ski-Folio family! We're excited to have you on board.</p>
            <p>
              Your account has been successfully created, and you're now ready to explore all the great
              features we offer.
            </p>
            <p>
              <a
                style="
                  display: inline-block;
                  text-decoration: none;
                  outline: none;
                  color: #fff;
                  background-color: #fc0038;
                  padding: 8px 16px;
                  border-radius: 4px;
                "
                href="https://ski-folio.netlify.app"
                target="_blank"
              >
                Open Ski-folio
              </a>
            </p>
            <p>Best regards,<br />The Ski-Folio Team</p>
          </div>
        </div>
      `
    };

    // Send the email using EmailJS
    const response = await emailjs.send(
      "service_mu4w5ko", // Your EmailJS service ID
      "template_g72ruh8", // Your EmailJS template ID
      templateParams
    );

    console.log("Email sent:", response.status, response.text);

    // Determine target Firestore collection
    const targetCollection = user.type === "applicant" ? "applicants" : "employers";

    // Add user to the approved collection with updated status
    await setDoc(doc(db, targetCollection, user.id), { ...user, status: "approved" });

    // Remove user from pending approval collection
    await deleteDoc(doc(db, "userAccountsToBeApproved", user.id));

    // Update local state
    setUsersToApprove((prev) => prev.filter((u) => u.id !== user.id));

    // Log action in history
    await addHistoryRecord("User Approved", `User ${user.id} approved.`);

    alert("User approved successfully.");
  } catch (error) {
    console.error("Error approving user:", error);
    alert("Failed to approve user. Please try again.");
  }
};


// Reject User
const handleRejectUser = async (user) => {
    try {
        // Move user data to the `deletedFiles` collection
        await setDoc(doc(db, "deletedFiles", user.id), user);


        // Remove user from the approval collection
        await deleteDoc(doc(db, "userAccountsToBeApproved", user.id));


        // Update local state
        setUsersToApprove(usersToApprove.filter((u) => u.id !== user.id));
        alert("User rejected and moved to deleted files.");


        await addHistoryRecord('User Rejected', `User ${user.id} rejected.`); // Add history record with timestamp


    } catch (error) {
        console.error("Error rejecting user:", error);
        alert("Failed to reject user. Please try again.");
    }
};


  // Fetch Employers
  useEffect(() => {
    const fetchEmployers = async () => {
      try {
        const employersSnapshot = await getDocs(collection(db, "employers"));
        const employersData = employersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEmployers(employersData);
      } catch (error) {
        console.error("Error fetching employers:", error);
      }
    };


    fetchEmployers();
  }, []);


  const handleLogin = () => {
    // Hardcoded Admin Credentials
    if (username === "admin" && password === "admin123") {
      setIsAdmin(true);
    } else {
      alert("Invalid credentials");
    }
  };
  // Handle Applicant Click
  const handleUserClick = async (user) => {
    if (selectedUserType === "Applicants") {
      // If the user is an applicant, set the user data with submissions and applied jobs
      setSelectedUser({
        ...user,
        submissions: user.submissions || [],
        appliedJobs: user.appliedJobs || [],
      });
    } else {
      // If the user is an employer, set the employer data and fetch the posted jobs
      setSelectedUser(user);
  
      // Fetch the jobs posted by the employer
      const employerJobsQuery = query(collection(db, "jobs"), where("employerId", "==", user.id));
      const employerJobsSnapshot = await getDocs(employerJobsQuery);
      const jobs = employerJobsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      
      setEmployerJobs(jobs);  // Update the state with the employer's jobs
      setSelectedJob(null);    // Reset the selected job
      setJobApplicants([]);   // Clear applicants for the selected job
    }
  };
  
  // Handle Employer Click: Fetch jobs posted by employer
  const handleEmployerClick = async (employer) => {
    setSelectedUser(employer);
    const employerJobsQuery = query(collection(db, "jobs"), where("employerId", "==", employer.id));
    const employerJobsSnapshot = await getDocs(employerJobsQuery);
  
    const jobs = employerJobsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    console.log("Fetched Jobs for Employer:", jobs);  // Debugging log
  
    setEmployerJobs(jobs);
  
    if (jobs.length === 0) {
      console.log("No jobs found for this employer.");  // Debugging log if no jobs are found
    }
    setSelectedJob(null);
    setJobApplicants([]);
  };
  
  


  // Handle Job Click: Fetch applicants for the selected job
  const handleJobClick = async (jobId) => {
    setSelectedJob(jobId);
    const applicantsRef = collection(db, "jobs", jobId, "applications");
    const applicantsSnapshot = await getDocs(applicantsRef);
    const applicants = applicantsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setJobApplicants(applicants);
  };
  const handleHiredClick = async (job) => {
    console.log("Received job object:", job);
  
    if (!job || !job.employerId) {
      console.error("Missing job or employerId");
      return;
    }
  
    setSelectedJob(job);
    setViewingHired(true);
  
    try {
      const hiredJobsRef = collection(db, "employers", job.employerId, "hired");
      const hiredJobsSnapshot = await getDocs(hiredJobsRef);
      const allHiredJobs = hiredJobsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
  
      const matched = allHiredJobs.find((h) => h.id === job.id);
  
      if (!matched || !matched.applicants) {
        setHiredJobData([]);
        return;
      }
  
      console.log("Setting hiredJobData to applicants:", matched.applicants);
      setHiredJobData(matched.applicants); // ✅ Set directly to array
  
    } catch (error) {
      console.error("Error fetching hired jobs:", error);
    }
  };
  
  
  
  // const handleHiredClick = async (jobId, employerId) => {
  //   // Clear any previous data first
  //   setSelectedJob(null); // Reset before setting new value
  //   setHiredJobData([]); // Assuming you have a state variable to store the hired job data
  //   setJobApplicants([]);
  //   // Now set the new selected job
  //   setSelectedJob(jobId);
    
  //   try {
  //     console.log(`Loading fresh data for employer: ${employerId}, job: ${jobId}`);
      
  //     // Reference to the hired subcollection for this employer
  //     const hiredJobsRef = collection(db, "employers", employerId, "hired");
      
  //     // The key issue was here - trying to use getDocs() with a document reference
  //     // Instead of querying the document directly, use getDoc() on a document reference
  //     const jobDocRef = doc(hiredJobsRef, jobId);
  //     const jobDocSnapshot = await getDoc(jobDocRef);
      
  //     let jobData = [];
      
  //     if (jobDocSnapshot.exists()) {
  //       console.log("Hired job data:", jobDocSnapshot.id, " => ", jobDocSnapshot.data());
  //       const docData = jobDocSnapshot.data();
        
  //       // Check if the data has an applicants array and flatten it
  //       if (docData.applicants && Array.isArray(docData.applicants)) {
  //         // Extract the applicants as our main data - this makes the nested data more accessible
  //         jobData = docData.applicants.map(applicant => ({
  //           ...applicant,
  //           jobDocId: jobDocSnapshot.id // Add the parent doc id for reference
  //         }));
  //       } else {
  //         // If structure is different than expected, just use the whole document
  //         jobData.push({
  //           id: jobDocSnapshot.id,
  //           ...docData
  //         });
  //       }
  //     } else {
  //       // Alternative: Query for documents where jobId field matches
  //       const jobQuery = query(hiredJobsRef, where("jobId", "==", jobId));
  //       const querySnapshot = await getDocs(jobQuery);
        
  //       if (querySnapshot.empty) {
  //         console.log("No matching hired job found");
  //       } else {
  //         // Process each document
  //         querySnapshot.docs.forEach(doc => {
  //           const docData = doc.data();
  //           console.log(doc.id, " => ", docData);
            
  //           // Check if the data has an applicants array and flatten it
  //           if (docData.applicants && Array.isArray(docData.applicants)) {
  //             // Add each applicant to our data array with reference to the parent doc
  //             docData.applicants.forEach(applicant => {
  //               jobData.push({
  //                 ...applicant,
  //                 jobDocId: doc.id // Add the parent doc id for reference
  //               });
  //             });
  //           } else {
  //             // If structure is different, just add the whole document
  //             jobData.push({
  //               id: doc.id,
  //               ...docData
  //             });
  //           }
  //         });
  //       }
  //     }
      
  //     console.log("Processed job data:", jobData);
      
  //     // Update state with the processed data
  //     setHiredJobData(jobData);
      
  //   } catch (error) {
  //     console.error("Error fetching hired job:", error);
  //     // Reset on error
  //     setHiredJobData([]);
  //   }
  // };
  // Handle Applicant Click (from employer's job applicants)
// Separate handlers for each modal
const handleApplicantClick = (applicant) => {
  if (selectedApplicant && selectedApplicant.name === applicant.name) {
    setSelectedApplicant(null);
  } else {
    setSelectedApplicant(applicant);
    setIsApplicant(true)
  }
};
const openHiredModal = (jobData) => {
  // Make sure to load hired job data separately 
  // Load your data here, e.g., from an API call or your data source
  // For example: loadHiredData(jobId).then(data => setHiredJobData(data));
  
  setHiredJobData(jobData); // Set this to your actual hired applicants data
  setViewingHired(true);
  
  // IMPORTANT: Do not set selectedJob when opening hired modal
};

const handleHiredApplicantClick = (applicant) => {
  if (selectedHiredApplicant && selectedHiredApplicant.name === applicant.name) {
    setSelectedHiredApplicant(null);
  } else {
    setSelectedHiredApplicant(applicant);
  }
};
  const closeHiredModal = () => {
    setViewingHired(false);
    setSelectedHiredApplicant(null);
  };
  // Close Modals
  const handleCloseUserModal = () => {
    setSelectedUser(null);
    setEmployerJobs([]);
    setSelectedJob(null);
    setJobApplicants([]);
  };


  const handleCloseApplicantModal = () => {
    setSelectedApplicant(null);
  };
  const handleCloseHiredModal = () => {
    showHiredJobData(true);
  };
  const handleOpenHiredModal = () => {
    showHiredJobData(false);
  };
  const handlePublishJob = async (job) => {
    try {
      // Add job to the 'jobs' collection
      await setDoc(doc(db, "jobs", job.id), job);


      // Delete job from 'jobs-to-be-approved'
      await deleteDoc(doc(db, "jobs-to-be-approved", job.id));


      // Update local state
      setPendingJobs(pendingJobs.filter((j) => j.id !== job.id));
      setSelectedJob(null);
      alert("Job published successfully.");


      await addHistoryRecord('Job Published', `Job post #${job.id} published.`); // Add history record with timestamp


    } catch (error) {
      console.error("Error publishing job:", error);
      alert("Failed to publish job. Please try again.");
    }
  };
  const handleRejectJob = async (jobId) => {
    try {
      setIsApplicant(true)
      // Delete job from 'jobs-to-be-approved'
      await deleteDoc(doc(db, "jobs-to-be-approved", jobId));


      // Update local state
      setPendingJobs(pendingJobs.filter((j) => j.id !== jobId));
      setSelectedJob(null);
      alert("Job rejected successfully.");


      await addHistoryRecord('Job Post Rejected',  `Job post #${jobId} rejected.` );
    } catch (error) {
      console.error("Error rejecting job:", error);
      alert("Failed to reject job. Please try again.");
    }
  };
  useEffect(() => {
    const userDiv = document.querySelector(".user");
    if (userDiv) {
      if (selectedUserType === "JobsToBeApproved") {
        userDiv.classList.add("user");
      } else {
        userDiv.classList.remove("user");
      }
    }
  }, [selectedUserType]);


  const toggleUserDivClass = () => {
    setSelectedUserType(selectedUserType === "JobsToBeApproved" ? "Applicants" : "JobsToBeApproved");
  };


  
  const handleAnnouncementSend = async (e) => {
    e.preventDefault();
    if (!emailSubject || !emailBody || !recipientType) {
      console.error("Missing required data (subject, body, or recipient type).");
      alert("Please fill out all fields and select a recipient type.");
      return;
    }
  
    try {
      // If there's an image file, upload it to Firebase Storage
      let imageUrl = '';
      if (imageFile) {
        const storageRef = ref(storage, `images/${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(storageRef);
        console.log('Image URL:', imageUrl);
      }


      const recipientTypesToSend = recipientType === "both" 
      ? ["applicant", "employer"] 
      : [recipientType];
  
      const emailContent = `
        <p>${emailBody}</p>
        ${imageUrl ? `<img src="${imageUrl}" alt="Attached Image" style="max-width: 100%; height: auto;" />` : ""}
      `;
  
      const notificationsRef = collection(db, "announcement");
      const timestamp = Date.now();
  
      for (const type of recipientTypesToSend) {
        const newNotification = {
          subject: emailSubject,
          message: emailContent,
          timestamp: new Date(),
          recipientType: type, // "applicant" or "employer"
          status: "unread",
          imageUrl: imageUrl || null,
          // Optionally include recipient IDs if needed
          // recipients: (recipientType === "applicant" ? applicants : employers).map(user => user.id),
        };
    
        const docId = `${type}_${timestamp}`;
        await setDoc(doc(notificationsRef, docId), newNotification);
      }
      alert("Announcement sent successfully!");
  
      setEmailSubject("");
      setEmailBody("");
      setImageFile(null);
      setRecipientType(null);
    } catch (error) {
      console.error("Error sending notification:", error);
      alert("Failed to send announcement.");
    }
  };  
  
  


  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file); // Store the selected image
    }
  };
  
  
  if (!isAdmin) {
    return (
        <div style={{ 
            display: "flex", 
            justifyContent: "center", 
            alignItems: "center", 
            minHeight: "80vh",  // Adjusted height
            fontFamily: "Arial, sans-serif"
        }}>
            <form onSubmit={handleLogin} style={{ 
                display: "flex", 
                flexDirection: "column", 
                alignItems: "center", 
                width: "100%", 
                maxWidth: "600px", 
                padding: "60px 40px", // More compact
                borderRadius: "10px", 
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)", 
                background: "white",
                textAlign: "center"
            }}>
                <h2 style={{ marginBottom: "15px", fontFamily: "Times New Roman" }}>Admin Login</h2>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    style={{ 
                        width: "100%", 
                        padding: "10px", 
                        marginBottom: "10px", 
                        borderRadius: "5px", 
                        border: "1px solid #ccc", 
                        fontSize: "16px", 
                        textAlign: "center"
                    }}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ 
                        width: "100%", 
                        padding: "10px", 
                        marginBottom: "10px", 
                        borderRadius: "5px", 
                        border: "1px solid #ccc", 
                        fontSize: "16px", 
                        textAlign: "center"
                    }}
                />
                <button
                    type="submit"
                    style={{
                        width: "100%",
                        padding: "10px", 
                        backgroundColor: "#007bff", 
                        color: "#fff", 
                        border: "none", 
                        borderRadius: "5px", 
                        cursor: "pointer",
                        fontSize: "16px",
                        transition: "0.3s"
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = "#0056b3"}
                    onMouseOut={(e) => e.target.style.backgroundColor = "#007bff"}
                >
                    Login
                </button>
            </form>
        </div>
    );
  }
  return (
    <><div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>


      <button
      onClick={() => {
        // Example log-out logic: remove user data or session
        localStorage.removeItem("authToken"); // Adjust according to your auth mechanism
        window.location.href = "./"; // Redirect to login page after logout
      }}
      style={{
        position: "absolute", // Absolute positioning to place it at the top right
        top: "20px",
        right: "20px",
        padding: "10px 20px",
        backgroundColor: "#f44336", // Red background for logout
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        fontWeight: "bold",
        transition: "background-color 0.3s",
      }}
      onMouseEnter={(e) => e.target.style.backgroundColor = "#d32f2f"} // Darker red on hover
      onMouseLeave={(e) => e.target.style.backgroundColor = "#f44336"} // Revert on leave
    >
      Log Out
    </button>


    {/* User Type Toggle*/}
    <div style={{ display: "flex" }}>
      {/* Side Navigation */}
      <div style={{
        width: "240px",
        background: "linear-gradient(to bottom, #66e0c8, #1ac7b3)",
        color: "#004d4d",
        padding: "20px",
        height: "100vh",
        borderRight: "1px solid #ddd",
        boxSizing: "border-box",
        position: "fixed",
        top: 0,
        left: 0
      }}>
    <h2 style={{ marginBottom: "20px", fontFamily: "Arial, sans-serif" }}>Admin Page</h2>


    <button
      onClick={() => {
        setShowDashboard(true);
        setSelectedUserType("");
        setIsUserClassVisible(false);
        setUserApproval(false);
        setShowDeletedFiles(false);
        setHistoryVisible(false);
        setShowAnnouncement(false);
      }}
      style={{
        display: "block",
        width: "100%",
        marginBottom: "10px",
        padding: "10px",
        backgroundColor: showDashboard ? "#007bff" : "#ddd",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
      }}
    >
      Dashboard
    </button>


    <button
      onClick={() => {
        setSelectedUserType("Applicants");
        setShowDashboard(false);
        setIsUserClassVisible(false);
        setUserApproval(false);
        setShowDeletedFiles(false);
        setHistoryVisible(false);
        setShowAnnouncement(false);
        setViewingReport(false);
        setShowApplicant(true);
      }}
      style={{
        display: "block",
        width: "100%",
        marginBottom: "10px",
        padding: "10px",
        backgroundColor: selectedUserType === "Applicants" && !isUserClassVisible ? "#007bff" : "#ddd",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
      }}
    >
      View Applicants
    </button>
    <button
        onClick={() => {
          setSelectedUserType("Report");
          setShowDashboard(false);
          setIsUserClassVisible(false);
          setUserApproval(false);
          setShowDeletedFiles(false);
          setHistoryVisible(false);
          setShowAnnouncement(false);
          setShowApplicant(false);
          setViewingReport(true);
        }}
        style={{
          display: "block",
          width: "100%",
          marginBottom: "10px",
          padding: "10px",
          backgroundColor: selectedUserType === "Report" ? "#007bff" : "#ddd",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        View Reports
      </button>

    <button
      onClick={() => {
        setSelectedUserType("Employers");
        setShowDashboard(false);
        setIsUserClassVisible(false);
        setUserApproval(false);
        setShowDeletedFiles(false);
        setHistoryVisible(false);
        setShowAnnouncement(false);
        setViewingReport(false)
      }}
      style={{
        display: "block",
        width: "100%",
        marginBottom: "10px",
        padding: "10px",
        backgroundColor: selectedUserType === "Employers" && !isUserClassVisible ? "#007bff" : "#ddd",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
      }}
    >
      View Employers
    </button>


    <button
      onClick={handleToggleClass}
      style={{
        display: "block",
        width: "100%",
        marginBottom: "10px",
        padding: "10px",
        backgroundColor: isUserClassVisible && !isUserApproval && !historyVisible ? "#007bff" : "#ddd",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
      }}
    >
      Jobs to Be Approved
    </button>


    <button
      onClick={() => {
        setUserApproval(true);
        setShowDashboard(false);
        setShowDeletedFiles(false);
        setIsUserClassVisible(false);
        setSelectedUserType(false);
        setHistoryVisible(false);
        setShowAnnouncement(false);
      }}
      style={{
        display: "block",
        width: "100%",
        marginBottom: "10px",
        padding: "10px",
        backgroundColor: isUserApproval && !historyVisible ? "#007bff" : "#ddd",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
      }}
    >
      View User Accounts ({usersToApprove.length || 0} Waiting)
    </button>


    <button
      onClick={() => {
        setShowDeletedFiles(true);
        setShowDashboard(false);
        setUserApproval(false);
        setIsUserClassVisible(false);
        setSelectedUserType("");
        setHistoryVisible(false);
        setShowAnnouncement(false);
      }}
      style={{
        display: "block",
        width: "100%",
        marginBottom: "10px",
        padding: "10px",
        backgroundColor: showDeletedFiles ? "#007bff" : "#ddd",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
      }}
    >
      View Deleted Files
    </button>


    {/* Uncomment if History is needed */}
    {/* <button
      onClick={() => {
        setHistoryVisible(true);
        setShowDashboard(false);
        setShowDeletedFiles(false);
        setUserApproval(false);
        setIsUserClassVisible(false);
        setSelectedUserType("");
        setShowAnnouncement(false);
      }}
      style={{
        display: "block",
        width: "100%",
        marginBottom: "10px",
        padding: "10px",
        backgroundColor: historyVisible ? "#007bff" : "#ddd",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
      }}
    >
      History
    </button> */}


    <button
      onClick={() => {
        setShowAnnouncement(true);
        setShowDashboard(false);
        setHistoryVisible(false);
        setShowDeletedFiles(false);
        setUserApproval(false);
        setIsUserClassVisible(false);
        setSelectedUserType("");
      }}
      style={{
        display: "block",
        width: "100%",
        marginBottom: "10px",
        padding: "10px",
        backgroundColor: announcementVisible ? "#007bff" : "#ddd",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
      }}
    >
      Announcement
    </button>
  </div>


  {/* Main Content */}
  <div style={{ 
    flexGrow: 1, 
    padding: "20px",  
    marginLeft: "240px", 
    marginTop: "20px",
    width: "100%", 
    boxSizing: "border-box"
    }}>
    {/* All your tables and views go here */}


    {showDashboard && (
      <div>
        <h2 style={{ fontFamily: "Arial, sans-serif" }}>Dashboard</h2>
        <p style={{ color: "#555", marginBottom: "30px" }}>
        {currentDateTime.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric"
        })},{" "}
        {currentDateTime.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          second: "2-digit"
        })} </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", marginTop: "20px" }}>
          <div style={{...cardStyle, position: "relative"}}
            onMouseEnter={() => setHoverTotalUsers(true)}
            onMouseLeave={() => setHoverTotalUsers(false)}>
            <h3>Total Users</h3>
            <p>{(applicants.length || 0) + (employers.length || 0)}</p>
              {hoverTotalUsers && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: "0",
                    backgroundColor: "#f9f9f9",
                    border: "1px solid #ccc",
                    borderRadius: "5px",
                    padding: "10px",
                    marginTop: "5px",
                    boxShadow: "0px 2px 8px rgba(0,0,0,0.1)",
                    zIndex: 1
                  }}
                >
                  <p style={{ margin: 0 }}>Applicants: {applicants.length || 0}</p>
                  <p style={{ margin: 0 }}>Employers: {employers.length || 0}</p>
                </div>
              )}
          </div>
          <div style={cardStyle}>
            <h3>Jobs To Be Approved</h3>
            <p>{pendingJobs.length || 0}</p>
          </div>
          <div style={cardStyle}>
            <h3>Total Job Posts</h3>
            <p>{jobs.length || 0}</p>
          </div>
          <div style={cardStyle}>
            <h3>Pending Accounts</h3>
            <p>{usersToApprove.length || 0}</p>
          </div>
        </div>
      </div>
    )}


      {/* User Table */}
      {!isUserClassVisible && !isUserApproval && !showDashboard && !showDeletedFiles && !historyVisible && !announcementVisible && !viewingReport && selectedUserType !== "Report" && (
        <div className="user" style={{ border: "1px solid #ddd", borderRadius: "5px", padding: "20px" }}>
        <h3>{selectedUserType}</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid #ddd", padding: "10px" }}>
                {selectedUserType === "Applicants" ? "Name" : "Company Name"}
              </th>
              <th style={{ border: "1px solid #ddd", padding: "10px" }}>
                {selectedUserType === "Applicants" ? "GitHub Repo" : "Company Website"}
              </th>
              
              <th style={{ border: "1px solid #ddd", padding: "10px" }}>Details</th>
            </tr>
          </thead>
          <tbody>
            {selectedUserType === "Applicants" &&
              applicants.map((applicant) => (
                <tr key={applicant.id || applicant.userId}>
                  <td style={{ border: "1px solid #ddd", padding: "10px" }}>{applicant.name}</td>
                  <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                    <a
                      href={applicant.githubRepo}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#007bff", textDecoration: "none" }}
                    >
                      {applicant.githubRepo}
                    </a>
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "10px", textAlign: "center" }}>
                    <button
                      onClick={() => handleUserClick(applicant)}
                      style={{
                        padding: "5px 10px",
                        backgroundColor: "#007bff",
                        color: "#fff",
                        border: "none",
                        borderRadius: "3px",
                        cursor: "pointer",
                      }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}


            {selectedUserType === "Employers" &&
              employers.map((employer) => (
                <tr key={employer.id || employer.userId}>
                  <td style={{ border: "1px solid #ddd", padding: "10px" }}>{employer.companyName}</td>
                  <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                    <a
                      href={employer.companyWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#007bff", textDecoration: "none" }}
                    >
                      {employer.companyWebsite}
                    </a>
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "10px", textAlign: "center" }}>
                    <button
                      onClick={() => handleUserClick(employer)}
                      style={{
                        padding: "5px 10px",
                        backgroundColor: "#007bff",
                        color: "#fff",
                        border: "none",
                        borderRadius: "3px",
                        cursor: "pointer",
                      }}
                    >
                      View
                    </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Detailed Applicant Modal */}


      {selectedUser && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "20px",
              borderRadius: "5px",
              maxWidth: "600px",
              width: "90%",
              maxHeight: "80%",
              overflowY: "auto",
            }}
          >
            <h4>{selectedUserType === "Applicants" ? "Applicant Details" : ("Employer Details" && selectedUserType !== "JobsToBeApproved")}</h4>


            {selectedUserType === "Applicants" && !isUserClassVisible ? (
  <>

    <div>
      <img
        src={selectedUser.profilePicURL}
        alt={`${selectedUser.name}'s Profile`}
        style={{ width: "150px", borderRadius: "50%" }}
      />
      <p><strong>Name:</strong> {selectedUser.name}</p>
      <p><strong>Email:</strong> {selectedUser.email}</p>
      <p><strong>Experience:</strong> {selectedUser.experience}</p>
      <p><strong>GitHub:</strong> <a href={selectedUser.githubRepo} target="_blank" rel="noopener noreferrer">{selectedUser.githubRepo}</a></p>

      <h3>Selected Jobs</h3>
      <ul>
        {selectedUser.selectedJobs?.map((job, index) => (
          <li key={index}>{job}</li>
        ))}
      </ul>

      <h3>Skills</h3>
      <ul>
        {Object.entries(selectedUser.skills || {}).map(([skill, hasSkill]) => (
          hasSkill ? <li key={skill}>{skill}</li> : null
        ))}
      </ul>

      <h3>Certifications</h3>

      {Object.entries(selectedUser.certifications || {}).map(([category, certArray]) => (
        <div key={category}>
          <h4>{category}</h4>
          {certArray.length === 0 ? (
            <p>No certifications.</p>
          ) : (
            certArray.map((cert, index) => (
              <div key={index} style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "10px" }}>
                <img src={cert.imageURL} alt={cert.name} style={{ width: "200px" }} />
                <p><strong>Name:</strong> {cert.name}</p>
                <p><strong>Issuer:</strong> {cert.issuer}</p>
                <p><strong>Issue Date:</strong> {cert.issueDate}</p>
                <p><strong>Expiry Date:</strong> {cert.expiryDate}</p>
                <p><strong>Credential ID:</strong> {cert.credentialID}</p>
              </div>
            ))
          )}
        </div>
      ))}

      {selectedUser.submissions && selectedUser.submissions.length > 0 && (
        <>
          <h5>Submissions</h5>
          <ul>
            {selectedUser.submissions.map((submission, index) => (
              <li key={index}>
                <strong>Live Demo:</strong>{" "}
                <a href={submission.liveDemoLink} target="_blank" rel="noopener noreferrer">
                  View
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>


    <div className="user-applications">
      <h3>Applied Jobs</h3>
      {appliedJobs.length > 0 ? (
        <ul>
          {appliedJobs.map((job, index) => (
            <li key={`applied-${job.id || index}`} className="job-item">
              <p><strong>Job Title:</strong> {job.title}</p>
              <p><strong>Location:</strong> {job.location}</p>
              <p><strong>Applied At:</strong> {job.appliedAt?.toDate ? job.appliedAt.toDate().toLocaleString() : "N/A"}</p>
              <p><strong>Status:</strong> {job.status}</p>
              <p><small>Application ID: {job.applicantId}</small></p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No applied jobs found.</p>
      )}

      <h3>Hired Jobs</h3>
      {hiredJobs.length > 0 ? (
        <ul>
          {hiredJobs.map((job, index) => (
            <li key={`hired-${job.id || index}`} className="job-item">
              <p><strong>Job Title:</strong> {job.title}</p>
              <p><strong>Location:</strong> {job.location}</p>
              <p><strong>Hired At:</strong> {job.appliedAt?.toDate ? job.appliedAt.toDate().toLocaleString() : "N/A"}</p>
              <p><strong>Status:</strong> {job.status}</p>
              <p><small>Application ID: {job.applicantId}</small></p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No hired jobs found.</p>
      )}
    </div>
  </>
) : selectedUserType !== "Applicants" &&  !isUserClassVisible ? (
  <>
    <p>
      <strong>Company Name:</strong> {selectedUser.companyName}
    </p>
    <p>
      <strong>Email:</strong> {selectedUser.email}
    </p>
    <p>
      <strong>Website:</strong> {selectedUser.companyWebsite}
    </p>
    <p>
      <strong>Contact-Person:</strong> {selectedUser.contactPerson}
    </p>
    <p>
      <strong>Location:</strong> {selectedUser.location}
    </p>
    <p>
      <strong>Phone:</strong> {selectedUser.phone}
    </p>
    <h5>Posted Jobs</h5>
    <ul>
      {employerJobs.map((job, index) => (
        <li key={index}>
          <p>
            <strong>Job Title:</strong> {job.title}
          </p>
          <p>
            <strong>Location:</strong> {job.location}
          </p>
          <p>
            <strong>Job Role:</strong> {job.jobRole}
          </p>
          <p>
            <button onClick={() => {
  handleJobClick(job.id);
  setShowApplicant(true);
}}
 style={{ cursor: "pointer" }}>
              View Applicants
            </button>
            <button onClick={() => {
                handleHiredClick(job);
                setShowApplicant(false);
                // handleOpenHiredModal();
              }}style={{ cursor: "pointer" }}>
              View Hired
            </button>
          </p>
        </li>
      ))}
    </ul>
  </>
) : null}




            <button
              onClick={handleCloseUserModal}
              style={{
                marginTop: "20px",
                padding: "10px 15px",
                backgroundColor: "#007bff",
                color: "#fff",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Inside your modal or component where you're displaying the job applicants */}

{/* Regular Job Applicants Modal */}
{selectedJob && !viewingHired && applicantshow &&(
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    }}
  >
    <div
      style={{
        backgroundColor: "#fff",
        padding: "20px",
        borderRadius: "5px",
        maxWidth: "600px",
        width: "90%",
        maxHeight: "80%",
        overflowY: "auto",
        position: "relative",
      }}
    >
      {/* Close Button */}
      <button
        onClick={() => setSelectedJob(null)}
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          background: "none",
          border: "none",
          fontSize: "24px",
          cursor: "pointer",
          padding: "5px",
          fontWeight: "bold",
          color: "#333",
        }}
      >
        ×
      </button>
      
      {/* Regular Job Applicants Section */}
      <h4>Job Applicants</h4>
      <ul>
        {jobApplicants.map((applicant, index) => (
          <li key={index}>
            <p>
              <strong>Name:</strong> {applicant.name}
            </p>
            <p>
              <button
               onClick={() => {
                handleApplicantClick(applicant);
                setShowApplicant(true);
              }}
              
                style={{
                  padding: "5px 10px",
                  backgroundColor: "#007bff",
                  color: "#fff",
                  border: "none",
                  borderRadius: "3px",
                  cursor: "pointer",
                }}
              >
                View Applicant
              </button>
            </p>
          </li>
        ))}
      </ul>
    </div>
  </div>
)}

{/* Completely Separate Hired Applicants Modal */}
{viewingHired && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1001,
    }}
  >
    <div
      style={{
        backgroundColor: "#fff",
        padding: "20px",
        borderRadius: "5px",
        maxWidth: "600px",
        width: "90%",
        maxHeight: "80%",
        overflowY: "auto",
      }}
    >
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "15px" 
      }}>
        <h4 style={{ margin: 0 }}>Hired Applicants</h4>
        <button 
          onClick={() => {
            setViewingHired(false);
            setSelectedHiredApplicant(null);
            // Don't modify selectedJob here
          }}
          style={{
            background: "none",
            border: "none",
            fontSize: "20px",
            cursor: "pointer",
            color: "#555"
          }}
        >
          &times;
        </button>
      </div>
      
      {/* Only render this content if hiredJobData exists */}
      {hiredJobData && hiredJobData.length > 0 ? (
  <ul className="list-none p-0 m-0 space-y-4">
    {hiredJobData.map((applicant, index) => (
      <li key={index} className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200 bg-white">
        <div className="flex justify-between items-center">
          <p className="font-medium text-lg text-gray-800 m-0">{applicant.name}</p>
          <button
            onClick={() => handleHiredApplicantClick(applicant)}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200 text-sm font-medium flex items-center"
          >
            {selectedHiredApplicant && selectedHiredApplicant.userId === applicant.userId 
              ? 'Hide Details' 
              : 'View Details'
            }
          </button>
        </div>

        {/* Applicant detail section when selected */}
        {selectedHiredApplicant && selectedHiredApplicant.userId === applicant.userId && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-start">
                <span className="font-semibold text-gray-700 mr-2">Email:</span>
                <span className="text-gray-600 break-all">{applicant.email}</span>
              </div>
              <div className="flex items-start">
                <span className="font-semibold text-gray-700 mr-2">GitHub:</span>
                <a 
                  href={applicant.githubRepo} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-blue-600 hover:text-blue-800 break-all"
                >
                  {applicant.githubRepo}
                </a>
              </div>
              <div className="flex items-start">
                <span className="font-semibold text-gray-700 mr-2">Applied At:</span>
                <span className="text-gray-600">{applicant.appliedAt?.toDate().toLocaleString() || 'N/A'}</span>
              </div>
              <div className="flex items-start">
                <span className="font-semibold text-gray-700 mr-2">Job ID:</span>
                <span className="text-gray-600 font-mono text-sm">{applicant.jobId}</span>
              </div>
              <div className="flex items-start">
                <span className="font-semibold text-gray-700 mr-2">User ID:</span>
                <span className="text-gray-600 font-mono text-sm">{applicant.userId}</span>
              </div>
            </div>

            {/* Certifications if they exist */}
            {applicant.certifications && (
              <div className="mt-4">
                <p className="font-semibold text-gray-700 mb-2">Certifications:</p>
                <div className="space-y-4">
                  {Object.entries(applicant.certifications).map(([category, certs]) => 
                    certs.length > 0 && (
                      <div key={category} className="bg-white border border-gray-200 rounded-md overflow-hidden">
                        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                          <h4 className="font-medium text-gray-700">{category}</h4>
                        </div>
                        <div className="p-0">
                          {certs.map((cert, idx) => (
                            <div key={idx} className="p-4 border-b border-gray-100 last:border-b-0">
                              <div className="flex flex-col space-y-2">
                                <div className="flex justify-between">
                                  <span className="font-medium text-gray-800">{cert.name}</span>
                                  <span className="text-sm text-gray-500">ID: {cert.credentialID}</span>
                                </div>
                                <div className="text-sm text-gray-600">Issued by {cert.issuer}</div>
                                <div className="flex justify-between text-sm text-gray-600">
                                  <span>Issued: {new Date(cert.issueDate).toLocaleDateString()}</span>
                                  <span>Expires: {new Date(cert.expiryDate).toLocaleDateString()}</span>
                                </div>
                                {cert.imageURL && (
                                  <div className="mt-2">
                                    <img 
                                      src={cert.imageURL} 
                                      alt={`${cert.name} Certificate`} 
                                      style={{ width: '100%', height: 'auto' }} 
                                    />

                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Optional profile image */}
            {applicant.imageURL && !applicant.certifications && (
              <div className="mt-4">
                <p className="font-semibold text-gray-700 mb-2">Profile Image:</p>
                <img 
                  src={applicant.imageURL} 
                  alt="Profile" 
                  className="max-w-full h-auto rounded-md border border-gray-200 shadow-sm"
                />
              </div>
            )}
          </div>
        )}
      </li>
    ))}
  </ul>
) : (
  <div className="flex flex-col items-center justify-center py-12 px-4">
    <p className="text-gray-500 text-lg">No hired applicants available.</p>
  </div>
)}

      
      <button
        onClick={() => {
          setViewingHired(false);
          setSelectedHiredApplicant(null);


          // Don't modify selectedJob here
        }}
        style={{
          marginTop: "20px",
          padding: "10px 15px",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          display: "block",
          width: "100%"
        }}
      >
        Close
      </button>
    </div>
  </div>
)}
{/* Job Applicants Modal */}
{/* {hiredJobData && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    }}
  >
    <div
      style={{
        backgroundColor: "#fff",
        padding: "20px",
        borderRadius: "5px",
        maxWidth: "600px",
        width: "90%",
        maxHeight: "80%",
        overflowY: "auto",
      }}
    > */}
      {/* Regular Job Applicants Section */}
      {/* <h4>Job Applicants</h4>
      <ul>
        {hiredJobData.map((applicant, index) => (
          <li key={index}>
            <p>
              <strong>Name:</strong> {applicant.name}
            </p>
            <p>
              <button
                onClick={() => handleApplicantClick(applicant)}
                style={{
                  padding: "5px 10px",
                  backgroundColor: "#007bff",
                  color: "#fff",
                  border: "none",
                  borderRadius: "3px",
                  cursor: "pointer",
                }}
              >
                View Applicant
              </button>
            </p>
          </li>
        ))}
      </ul>
    
    </div>
  </div>
)} */}


      {/* Applicant Detailed View */}
      {selectedApplicant && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 2000,
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "20px",
              borderRadius: "5px",
              maxWidth: "600px",
              width: "90%",
              maxHeight: "80%",
              overflowY: "auto",
            }}
          >
            <h4>Applicant Details</h4>
            <p>
              <strong>Name:</strong> {selectedApplicant.name}
            </p>
            <p>
              <strong>Email:</strong> {selectedApplicant.email}
            </p>
            <p>
              <strong>Resume:</strong>{" "}
              <a href={selectedApplicant.resumeURL} target="_blank" rel="noopener noreferrer">
                View Resume
              </a>
            </p>
            <button
              onClick={handleCloseApplicantModal}
              style={{
                marginTop: "20px",
                padding: "10px 15px",
                backgroundColor: "#007bff",
                color: "#fff",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    
    {(isUserClassVisible == true) && !selectedUser && !showDashboard && !showDeletedFiles && !announcementVisible && !historyVisible &&(
        <div  style={{ border: "1px solid #ddd", borderRadius: "5px", padding: "20px", fontFamily: "Arial, sans-serif" }}>
          <h3>Jobs to Be Approved</h3>


          {/* Pending Jobs Table */}
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ border: "1px solid #ddd", padding: "10px" }}>Job Title</th>
                <th style={{ border: "1px solid #ddd", padding: "10px" }}>Company Name</th>
                <th style={{ border: "1px solid #ddd", padding: "10px" }}>Location</th>
                <th style={{ border: "1px solid #ddd", padding: "10px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingJobs.map((job) => (
                <tr key={job.id}>
                  <td style={{ border: "1px solid #ddd", padding: "10px" }}>{job.title}</td>
                  <td style={{ border: "1px solid #ddd", padding: "10px" }}>{job.companyName}</td>
                  <td style={{ border: "1px solid #ddd", padding: "10px" }}>{job.location}</td>
                  <td style={{ border: "1px solid #ddd", padding: "10px", textAlign: "center" }}>
                    <button
                      onClick={() => {
                        setSelectedJob(job);
                        setIsApplicant(false);
                      }}
                      style={{
                        padding: "5px 10px",
                        marginRight: "5px",
                        backgroundColor: "#007bff",
                        color: "#fff",
                        border: "none",
                        borderRadius: "3px",
                        cursor: "pointer",
                      }}
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleRejectJob(job.id)}
                      style={{
                        padding: "5px 10px",
                        backgroundColor: "#ff4d4d",
                        color: "#fff",
                        border: "none",
                        borderRadius: "3px",
                        cursor: "pointer",
                      }}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

              
          {/* Job Details Modal */}
          {selectedJob && !isApplicant && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <div
                id="jobdetails"
                style={{
                  backgroundColor: "#fff",
                  padding: "20px",
                  borderRadius: "5px",
                  maxWidth: "600px",
                  width: "90%",
                  maxHeight: "80%",
                  overflowY: "auto",
                }}
              >
                <h4>Job Details</h4>
                <p>
                  <strong>Title:</strong> {selectedJob.title}
                </p>
                <p>
                  <strong>Job Role:</strong> {selectedJob.jobRole}
                </p>
                <p>
                  <strong>Company Name:</strong> {selectedJob.companyName}
                </p>
                <p>
                  <strong>Location:</strong> {selectedJob.location}
                </p>
                <p>
                  <strong>Description:</strong> {selectedJob.description || "No description provided."}
                </p>
                <button
                  onClick={() => {
                    handlePublishJob(selectedJob);
                    setSelectedJob(null);
                  }}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#28a745",
                    color: "#fff",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    marginRight: "10px",
                  }}
                >
                  Publish
                </button>
                <button
                  onClick={() => setSelectedJob(null)}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#6c757d",
                    color: "#fff",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  Close
                </button>
              </div>
            </div>
            
          )}
        </div>
      )}


      {/* View User Acconts To Be Approve Section */}
      {!showDeletedFiles && !isUserClassVisible && !selectedUserType && !showDashboard && !historyVisible && !announcementVisible && !viewingReport &&(
        <div  style={{ border: "1px solid #ddd", borderRadius: "5px", padding: "20px", fontFamily: "Arial, sans-serif" }}>
            <h3>Users Pending Approval</h3>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                    <tr>
                        <th style={{ border: "1px solid #ddd", padding: "10px" }}>Name/Company</th>
                        <th style={{ border: "1px solid #ddd", padding: "10px" }}>Email</th>
                        <th style={{ border: "1px solid #ddd", padding: "10px" }}>Type</th>
                        <th style={{ border: "1px solid #ddd", padding: "10px" }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {usersToApprove.map((user) => (
                        <tr key={user.id}>
                            <td style={{ border: "1px solid #ddd", padding: "10px" }}>{user.type === "applicant" ? user.name : user.companyName}</td>
                            <td style={{ border: "1px solid #ddd", padding: "10px" }}>{user.email}</td>
                            <td style={{ border: "1px solid #ddd", padding: "10px" }}>{user.type}</td>
                            <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                                <button 
                                  onClick={() => handleApproveUser(user)
                                  }
                                  style={{
                                    padding: "5px 10px",
                                    marginRight: "5px",
                                    backgroundColor: "#007bff",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "3px",
                                    cursor: "pointer",
                                  }}
                                  >Approve
                                  </button>
                                <button 
                                  onClick={() => handleRejectUser(user)
                                  }
                                  style={{
                                    padding: "5px 10px",
                                    marginRight: "5px",
                                    backgroundColor: "#ff4d4d",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "3px",
                                    cursor: "pointer",
                                  }}
                                  >Reject
                                  </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )}
    {/* Archives Section */}
    {showDeletedFiles && !selectedUserType && !isUserClassVisible && !showDashboard && !historyVisible && !announcementVisible && !viewingReport &&(
        <div  style={{ border: "1px solid #ddd", borderRadius: "5px", padding: "20px", fontFamily: "Arial, sans-serif" }}>
            <h3>Deleted Files</h3>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                    <tr>
                        <th style={{ border: "1px solid #ddd", padding: "10px" }}>Name/Company</th>
                        <th style={{ border: "1px solid #ddd", padding: "10px" }}>Email</th>
                        <th style={{ border: "1px solid #ddd", padding: "10px" }}>Type</th>
                        <th style={{ border: "1px solid #ddd", padding: "10px" }}>Reason</th>
                    </tr>
                </thead>
                <tbody>
                    {deletedFiles.map((file) => (
                        <tr key={file.id}>
                            <td style={{ border: "1px solid #ddd", padding: "10px" }}>{file.type === "applicant" ? file.name : file.companyName}</td>
                            <td style={{ border: "1px solid #ddd", padding: "10px" }}>{file.email}</td>
                            <td style={{ border: "1px solid #ddd", padding: "10px" }}>{file.type}</td>
                            <td style={{ border: "1px solid #ddd", padding: "10px" }}>{file.reason || "N/A"}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )}


{/* {historyVisible && !isUserApproval && !showDeletedFiles && !selectedUserType && !isUserClassVisible && !announcementVisible && !showDashboard && (
        <div style={{  border: "1px solid #ddd", borderRadius: "5px", padding: "20px" }}>
          <h3>History</h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ border: "1px solid #ddd", padding: "10px" }}>Timestamp</th>
                <th style={{ border: "1px solid #ddd", padding: "10px" }}>Event</th>
                <th style={{ border: "1px solid #ddd", padding: "10px" }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {historyData.map((record, index) => (
                <tr key={index}>
                  <td style={{ border: "1px solid #ddd", padding: "10px" }}>{record.timestamp}</td>
                  <td style={{ border: "1px solid #ddd", padding: "10px" }}>{record.event}</td>
                  <td style={{ border: "1px solid #ddd", padding: "10px" }}>{record.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )} */}


      {/* Announcement tab */}
      {announcementVisible && !showDashboard && !historyVisible && !isUserApproval && !showDeletedFiles && !selectedUserType && !isUserClassVisible && !viewingReport && (
        <div
          style={{
            marginTop: "20px",
            marginLeft: "auto",
            marginRight: "auto",
            padding: "10px 20px",
            border: "1px solid #ddd",
            borderRadius: "5px",
            backgroundColor: "#f9f9f9",
            maxWidth: "1200px",
            width: "90%",
            textAlign: "center",
          }}
        >
          <h3>Announcement</h3>
          <p>This is for important announcement!</p>


          <input
            type="text"
            placeholder="Announcement Subject"
            value={emailSubject}
            onChange={(e) => setEmailSubject(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: '10px',
              borderRadius: '5px',
            }}
          />
          <textarea
            placeholder="Announcement Body"
            value={emailBody}
            onChange={(e) => setEmailBody(e.target.value)}
            rows="4"
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '5px',
              marginBottom: '10px',
            }}
          />


          <div>
          <label htmlFor="image-upload" style={{ marginBottom: '10px', display: 'block' }}>
            Upload Image:
          </label>
          <input
            type="file"
            id="image-upload"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ marginBottom: '10px' }}
          />
        </div>


          {/* Recipient Dropdown */}
          <div style={{ marginTop: "10px" }}>
            <label>
              Select Recipient Type:
              <select
                value={recipientType || ""}
                onChange={(e) => setRecipientType(e.target.value)}
                style={{
                  marginLeft: "10px",
                  padding: "8px",
                  borderRadius: "5px",
                  fontSize: "16px",
                }}
              >
                <option value="">Select Recipient</option>
                <option value="applicant">Applicant</option>
                <option value="employer">Employer</option>
                <option value="both">All</option>
              </select>
            </label>
          </div>


          <button
            onClick={ (e) => handleAnnouncementSend(e)}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              backgroundColor: "#28a745",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Send Announcement
          </button>
        </div>
      )}
      </div>
</div>

</div>
{selectedUserType === "Report" && (
  <div style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
    <h2 style={{ marginBottom: '10px' }}>📋 Reports</h2>
    <p style={{ color: '#666', marginBottom: '30px' }}>
      Review user-submitted reports regarding policy violations or inappropriate behavior.
    </p>

    {reportShow.length === 0 ? (
      <p style={{ textAlign: 'center', color: 'gray' }}>No reports available.</p>
    ) : (
      reportShow.map((report, index) => {
        const isUnread = report.status === 'pending';
        const isApplicantReport = report.hasOwnProperty('applicantName');
        const isEmployerReport = report.hasOwnProperty('companyName');
        const isSelected = viewingReport === report;

        return (
          <div
            key={index}
            onClick={() => {
              setViewingReport(isSelected ? null : report); // Toggle selection
              const updated = [...reportShow];
              updated[index].status = 'read';
              setShowReport(updated);
            }}
            style={{
              backgroundColor: isSelected ? '#f9f9f9' : '#fff',
              border: '1px solid #ddd',
              borderLeft: `5px solid ${isUnread ? '#e53935' : '#43a047'}`,
              borderRadius: '10px',
              padding: '18px 20px',
              marginBottom: '18px',
              cursor: 'pointer',
              boxShadow: isSelected
                ? '0 4px 12px rgba(0,0,0,0.1)'
                : '0 2px 6px rgba(0,0,0,0.05)',
              transition: 'all 0.2s ease-in-out',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ fontSize: '16px' }}>
                {isEmployerReport ? report.reporterName : report.applicantName}
              </strong>
              <span
                style={{
                  backgroundColor: isUnread ? '#ffebee' : '#e8f5e9',
                  color: isUnread ? '#c62828' : '#2e7d32',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: '500',
                }}
              >
                {isUnread ? 'Pending' : 'Read'}
              </span>
            </div>

            <p style={{ marginTop: '6px', fontStyle: 'italic', color: '#555' }}>
              {isEmployerReport
                ? `Job Title: ${report.jobTitle}`
                : `Violation: ${report.violationType}`}
            </p>

            {isSelected && (
              <div style={{ marginTop: '15px', fontSize: '14px', color: '#333' }}>
                {isEmployerReport ? (
                  <>
                    <p><strong>Company:</strong> {report.companyName}</p>
                    <p><strong>Reporter:</strong> {report.reporterName}</p>
                    <p><strong>Email:</strong> {report.reporterEmail}</p>
                    <p><strong>Employer ID:</strong> {report.employerId}</p>
                    <p><strong>Job ID:</strong> {report.jobId}</p>
                    <p><strong>Reason:</strong> {report.reason}</p>
                    <p><strong>Details:</strong> {report.details}</p>
                    <p><strong>Created At:</strong> {report.createdAt.toDate().toLocaleString()}</p>
                  </>
                ) : (
                  <>
                    <p><strong>Applicant:</strong> {report.applicantName}</p>
                    <p><strong>Email:</strong> {report.applicantEmail}</p>
                    <p><strong>Applicant ID:</strong> {report.applicantId}</p>
                    <p><strong>Reported By:</strong> {report.reportedBy}</p>
                    <p><strong>Violation:</strong> {report.violationType}</p>
                    <p><strong>Details:</strong> {report.details}</p>
                    <p><strong>Reported At:</strong> {new Date(report.reportedAt).toLocaleString()}</p>
                  </>
                )}
              </div>
            )}
          </div>
        );
      })
    )}
  </div>
)}
  </>
);
};


export default AdminPage;

{/* <div className="job-applicants-container">
  <h2>Job Applicants</h2>
   */}
  {/* First check if there's any data */}
//   {!showhired && hiredJobData && hiredJobData.length > 0 ? (
//     <div className="applicants-list"
//     style={{
//       position: "fixed",
//       top: 0,
//       left: 0,
//       width: "100%",
//       height: "100%",
//       backgroundColor: "rgba(0, 0, 0, 0.5)",
//       display: "flex",
//       justifyContent: "center",
//       alignItems: "center",
//       zIndex: 1000}}>
//       {/* Map through each applicant */}
//       {hiredJobData.map((applicant, index) => (
//         <div key={applicant.id || index} className="applicant-card"
        
//         style={{
//           backgroundColor: "white",
//           borderRadius: "8px",
//           padding: "20px",
//           maxWidth: "80%",
//           maxHeight: "80vh",
//           overflowY: "auto", // This makes it scrollable
//           boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
//         }}>
//           <h3>{applicant.name || 'Unnamed Applicant'}</h3>
          
//           <div className="applicant-details">
//             <p><strong>Email:</strong> {applicant.email || 'No email provided'}</p>
//             {applicant.githubRepo && (
//               <p><strong>GitHub Repo:</strong> <a href={applicant.githubRepo} target="_blank" rel="noopener noreferrer">{applicant.githubRepo}</a></p>
//             )}
            
//             {/* Show applied date if available */}
//             {applicant.appliedAt && (
//               <p><strong>Applied:</strong> {new Date(applicant.appliedAt.seconds * 1000).toLocaleDateString()}</p>
//             )}
            
//             {/* Display certifications if available */}
//             {applicant.certifications && (
//               <div className="certifications">
//                 <h4>Certifications</h4>
//                 <ul>
//                   {Object.entries(applicant.certifications).map(([cert, items]) => (
//                     items && items.length > 0 ? (
//                       <li key={cert}>
//                         <strong>{cert}:</strong> {items.join(', ')}
//                       </li>
//                     ) : null
//                   ))}
//                 </ul>
//               </div>
//             )}
            
//             {/* Display submissions if available */}
//             {applicant.submissions && applicant.submissions.length > 0 && (
//               <div className="submissions">
//                 <h4>Submissions ({applicant.submissions.length})</h4>
//                 {applicant.submissions.map((submission, subIndex) => (
//                   <div key={submission.id || subIndex} className="submission-item">
//                     <h5>Submission {subIndex + 1}</h5>
//                     {submission.liveDemoLink && (
//                       <p><strong>Live Demo:</strong> <a href={submission.liveDemoLink} target="_blank" rel="noopener noreferrer">{submission.liveDemoLink}</a></p>
//                     )}
                    
//                     {/* Display scores if available */}
//                     {submission.scores && (
//                       <div className="scores">
//                         <h6>Scores</h6>
//                         <ul>
//                           {Object.entries(submission.scores).map(([category, score]) => (
//                             <li key={category}><strong>{category}:</strong> {score}</li>
//                           ))}
//                         </ul>
//                       </div>
//                     )}
//                      {/* Use your existing close button or form handling mechanism instead */}
  
//                     {/* Display feedback if available */}
//                     {submission.feedback && (
//                       <div className="feedback">
//                         <h6>Feedback</h6>
//                         {Object.entries(submission.feedback).map(([category, items]) => (
//                           items && items.length > 0 ? (
//                             <div key={category} className="feedback-category">
//                               <strong>{category}:</strong>
//                               <ul>
//                                 {items.map((item, i) => (
//                                   <li key={i}>{item}</li>
//                                 ))}
//                               </ul>
//                             </div>
//                           ) : null
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//           <button className="close-button"
//                       onClick={() => handleCloseHiredModal()}
//                     >Close</button>
//         </div>
//       ))}
      
//     </div>
//   ) : (
//     <p>No applicants found for this job.</p>
//   )}
  
 
// </div>