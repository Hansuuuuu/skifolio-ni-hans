import React, { useState, useEffect } from "react";
import { db, storage } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
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


  // const [announcements, setAnnouncements] = useState([]);
  // const [newAnnouncement, setNewAnnouncement] = useState('');
    const [activeTab, setActiveTab] = useState('manageUsers');


  // Function to add history record with a timestamp
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
        const targetCollection = user.type === "applicant" ? "applicants" : "employers";


        // Add user to the target collection
        await setDoc(doc(db, targetCollection, user.id), { ...user, status: "approved" });


        // Remove user from the approval collection
        await deleteDoc(doc(db, "userAccountsToBeApproved", user.id));


        // Update local state
        setUsersToApprove(usersToApprove.filter((u) => u.id !== user.id));
        alert("User approved successfully.");


        await addHistoryRecord('User Approved', `User ${user.id} approved.`); // Add history record with timestamp


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
  


  // Handle Applicant Click (from employer's job applicants)
  const handleApplicantClick = (applicant) => {
    setSelectedApplicant(applicant);
    setIsApplicant(true);
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
        setSelectedUserType("Employers");
        setShowDashboard(false);
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
      {!isUserClassVisible && !isUserApproval && !showDashboard && !showDeletedFiles && !historyVisible && !announcementVisible && (
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
    <p>
      <strong>Name:</strong> {selectedUser.name}
    </p>
    <p>
      <strong>Email:</strong> {selectedUser.email}
    </p>
    <p>
      <strong>Resume:</strong>{" "}
      <a href={selectedUser.resumeURL} target="_blank" rel="noopener noreferrer">
        View Resume
      </a>
    </p>
    <h5>Submissions</h5>
    <ul>
      {selectedUser.submissions?.map((submission, index) => (
        <li key={index}>
          <strong>Live Demo:</strong>{" "}
          <a href={submission.liveDemoLink} target="_blank" rel="noopener noreferrer">
            View
          </a>{" "}
          | <strong>Demo Video:</strong>{" "}
          <a href={submission.demoVideoLink} target="_blank" rel="noopener noreferrer">
            Watch
          </a>
        </li>
      ))}
    </ul>
    <h5>Applied Jobs</h5>
    <ul>
      {selectedUser.appliedJobs?.map((job, index) => (
        <li key={index}>
          <p>
            <strong>Job Title:</strong> {job.title}
          </p>
          <p>
            <strong>Location:</strong> {job.location}
          </p>
          <p>
            <strong>Applied At:</strong> {job.appliedAt?.toDate().toLocaleString() || "N/A"}
          </p>
        </li>
      ))}
    </ul>
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
            <button onClick={() => handleJobClick(job.id)} style={{ cursor: "pointer" }}>
              View Applicants
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


      {/* Job Applicants Modal */}
      {selectedJob && (
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
            <h4>Job Applicants</h4>
            <ul>
              {jobApplicants.map((applicant, index) => (
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
            <button
              onClick={() => setSelectedJob(null)}
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
      {!showDeletedFiles && !isUserClassVisible && !selectedUserType && !showDashboard && !historyVisible && !announcementVisible &&(
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
    {showDeletedFiles && !selectedUserType && !isUserClassVisible && !showDashboard && !historyVisible && !announcementVisible &&(
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
      {announcementVisible && !showDashboard && !historyVisible && !isUserApproval && !showDeletedFiles && !selectedUserType && !isUserClassVisible && (
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


    </>
  );
};


export default AdminPage;