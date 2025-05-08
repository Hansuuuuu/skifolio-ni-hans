// import React, { useState, useEffect } from "react";
// import { db, auth, storage } from "../firebase";
// import { doc, getDoc, updateDoc, collection, query, where, getDocs, deleteDoc,addDoc } from "firebase/firestore";
// import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
// import { onSnapshot } from "firebase/firestore";
// import "../styles.css";

// const EmployerProfile = () => {
//     const [employer, setEmployer] = useState(null);
//     const [jobPosts, setJobPosts] = useState([]);
//     const [applicants, setApplicants] = useState({});
//     const [selectedJob, setSelectedJob] = useState(null);
//     const [selectedApplicant, setSelectedApplicant] = useState(null);
//     const [isEditing, setIsEditing] = useState(false);
//     const [emailSubject, setEmailSubject] = useState("");
//     const [emailBody, setEmailBody] = useState("");
//     const [editedData, setEditedData] = useState({
//         industry: "",
//         location: "",
//         description: "",
//         phone: "",
//         contactPerson: "",
//     });
//     const [profilePic, setProfilePic] = useState(null);
//     const [uploading, setUploading] = useState(false);

//     useEffect(() => {
//         const fetchEmployerData = async () => {
//             if (auth.currentUser) {
//                 const employerRef = doc(db, "employers", auth.currentUser.uid);
//                 const employerSnap = await getDoc(employerRef);
//                 if (employerSnap.exists()) {
//                     setEmployer(employerSnap.data());
//                     setEditedData({
//                         industry: employerSnap.data().industry,
//                         location: employerSnap.data().location,
//                         description: employerSnap.data().description,
//                         phone: employerSnap.data().phone,
//                         contactPerson: employerSnap.data().contactPerson,
//                     });
//                     setProfilePic(employerSnap.data().profilePic || "");
//                 } else {
//                     console.log("No employer data found.");
//                 }
//             }
//         };

//         const fetchJobPosts = async () => {
//             if (auth.currentUser) {
//                 const jobsRef = collection(db, "jobs");
//                 const q = query(jobsRef, where("employerId", "==", auth.currentUser.uid));
//                 const querySnapshot = await getDocs(q);
//                 setJobPosts(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
//             }
//         };

//         fetchEmployerData();
//         fetchJobPosts();
//     }, []);

//     useEffect(() => {
//         const unsubscribeMap = {};
    
//         jobPosts.forEach((job) => {
//             const applicationsRef = collection(db, "jobs", job.id, "applications");
    
//             // Listen for real-time changes
//             const unsubscribe = onSnapshot(applicationsRef, (snapshot) => {
//                 const applicantsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    
//                 setApplicants((prev) => ({
//                     ...prev,
//                     [job.id]: applicantsData, // Update the job's applicants
//                 }));
//             });
    
//             unsubscribeMap[job.id] = unsubscribe;
//         });
    
//         return () => {
//             Object.values(unsubscribeMap).forEach((unsubscribe) => unsubscribe());
//         };
//     }, [jobPosts]); // Ensure it re-runs when jobPosts change

//     const handleJobClick = (job) => {
//         setSelectedJob(job.id);
//     };
    
//     const handleApplicantClick = (applicant) => {
//         setSelectedApplicant(applicant);
//     };

//     const handleEditClick = () => {
//         setIsEditing(true);
//     };

//     const handleSaveClick = async () => {
//         if (auth.currentUser) {
//             const employerRef = doc(db, "employers", auth.currentUser.uid);
//             await updateDoc(employerRef, editedData);
//             setEmployer((prev) => ({ ...prev, ...editedData }));
//             setIsEditing(false);
//         }
//     };

//     const handleProfilePicChange = async (e) => {
//         const file = e.target.files[0];
//         if (file) {
//             setUploading(true);
//             const storageRef = ref(storage, `profile_pictures/${auth.currentUser.uid}`);
//             await uploadBytes(storageRef, file);
//             const downloadURL = await getDownloadURL(storageRef);

//             setProfilePic(downloadURL);
//             await updateDoc(doc(db, "employers", auth.currentUser.uid), { profilePic: downloadURL });

//             setUploading(false);
//         }
//     };

//     const handleDeleteJob = async (jobId) => {
//         const confirmDelete = window.confirm("Are you sure you want to delete this job post?");
//         if (confirmDelete) {
//             await deleteDoc(doc(db, "jobs", jobId));
//             setJobPosts((prev) => prev.filter((job) => job.id !== jobId));
//             alert("Job post deleted successfully!");
//         }
//     };
//     const handleCloseApplicantModal = () => {
//         setSelectedApplicant(null);
//     };

//     const handleChange = (e) => {
//         setEditedData({ ...editedData, [e.target.name]: e.target.value });
//     };

//   const handleEmailSend = async () => {
//     if (!selectedApplicant || !selectedJob || !employer) {
//         console.error("Missing required data (applicant, job, or employer).");
//         return;
//     }

//     try {
//         // Reference to the applicant's notifications subcollection
//         const notificationsRef = collection(db, "applicants", selectedApplicant.id, "notifications");

//         // Create the notification object with company name, email subject, and email body
//         const newNotification = {
//             jobId: selectedJob,
//             companyName: employer.companyName,  // Include company name
//             subject: emailSubject,  // Include email subject
//             message: emailBody,  // Include company name, subject, and body
//             timestamp: new Date(),
//             status: "unread",
//         };

//         // Add the notification to Firestore
//         await addDoc(notificationsRef, newNotification);

//         console.log("Notification added successfully!");

//         // Send email


//         // Show success alert
//         alert("Email sent successfully!");

//         // Close the applicant submission modal
//         setSelectedApplicant(null);
        
//     } catch (error) {
//         console.error("Error sending email or updating Firestore:", error);
//         alert("Failed to send email. Please try again.");
//     }
// };



//     return (
//       <div className="employer-profile">
//       <h2 style={{marginTop: "50px"}}>Employer Profile</h2>
//       {employer ? (
//         <div className="profile-details">
//           <div className="profile-picture">
//             <label htmlFor="profile-pic-upload">
//               <img src={profilePic || "/default-profile.png"} alt="Profile" className="profile-pic" />
//             </label>
//             <input type="file" id="profile-pic-upload" style={{ display: "none" }} onChange={handleProfilePicChange} />
//           </div>

//           <h3>{employer.companyName}</h3>
//           <p><strong>Industry:</strong> {isEditing ? <input type="text" name="industry" value={editedData.industry} onChange={handleChange} /> : employer.industry}</p>
//           <p><strong>Location:</strong> {isEditing ? <input type="text" name="location" value={editedData.location} onChange={handleChange} /> : employer.location}</p>
//           <p><strong>Description:</strong> {isEditing ? <input type="text" name="description" value={editedData.description} onChange={handleChange} /> : employer.description}</p>

//           <h3>Contact Information</h3>
//           <p><strong>Name:</strong> {isEditing ? <input type="text" name="contactPerson" value={editedData.contactPerson} onChange={handleChange} /> : employer.contactPerson}</p>
//           <p><strong>Email:</strong> {employer.email}</p>
//           <p><strong>Phone:</strong> {isEditing ? <input type="text" name="phone" value={editedData.phone} onChange={handleChange} /> : employer.phone}</p>

//           {isEditing ? (
//             <button className="save-btn" onClick={handleSaveClick}>Save Changes</button>
//           ) : (
//             <button className="edit-btn" onClick={handleEditClick}>Edit Profile</button>
//           )}
//                     <h3 style={{marginTop: "10px"}}>Jobs Posted</h3>
//                     {jobPosts.length > 0 ? (
//                         <ul className="job-list">
//                             {jobPosts.map((job) => (
//                                 <li key={job.id} onClick={() => handleJobClick(job)} className="clickable-job">
//                                     <h4>{job.title}</h4>
//                                     <p>{job.description}</p>
//                                     <p><strong>Location:</strong> {job.location}</p>

//                                     {selectedJob === job.id && (
//                                         <div id='JOBlist'>
//                                             <h5>Applicants:</h5>
//                                             <div style={{
//                                             maxHeight: '200px',
//                                             overflowY: 'auto',
//                                             border: '1px solid #ccc',
//                                             padding: '10px',
//                                             borderRadius: '5px',
//                                                                 }}
//                                          className="applicant-list">
//                                                 {applicants[job.id] && applicants[job.id].length > 0 ? (
//                                             applicants[job.id].map((applicant) => (
//                                                 <div
//                                                     key={applicant.id}
//                                                     style={{
//                                                         padding: '10px',
//                                                         margin: '10px 0',
//                                                         backgroundColor: '#f9f9f9',
//                                                         cursor: 'pointer',
//                                                         borderRadius: '5px',
//                                                     }}
//                                                     onClick={() => handleApplicantClick(applicant)}
//                                                 >
//                                                     <p><strong>Name:</strong> {applicant.name}</p>
//                                                 </div>
//                                             ))
//                                         ) : (
//                                             <p>No applicants yet.</p>
//                                         )}
//                                             </div>
//                                         </div>
//                                     )}
//                                     <button id="Delete" onClick={() => handleDeleteJob(job.id)}>Remove</button>
//                                 </li>
//                             ))}
//                         </ul>
//                     ) : (
//                         <p>No jobs posted yet.</p>
//                     )}

//                     {/* Applicant Modal */}
//                     {selectedApplicant && (
//                 <div className="modal-overlay1">
//                     <div className="modal-content1">
//                         <h4>Applicant Details</h4>
//                         <p><strong>Name:</strong> {selectedApplicant.name}</p>
//                         <p><strong>Email:</strong> {selectedApplicant.email}</p>
//                         <p><strong>Resume:</strong>{' '}
//                             <a
//                                 href={selectedApplicant.resumeURL}
//                                 target="_blank"
//                                 rel="noopener noreferrer"
//                             >
//                                 {selectedApplicant.resumeURL}
//                             </a>
//                         </p>

//                         <p><strong>Certifications:</strong></p>
//                         <div style={{ marginBottom: '20px' }}>
//                             {selectedApplicant.certifications && Object.keys(selectedApplicant.certifications).length > 0 ? (
//                                 Object.entries(selectedApplicant.certifications).map(([skill, certs]) => (
//                                     <div key={skill} style={{ marginBottom: '5px' }}>
//                                         <strong>{skill}:</strong>
//                                         <div>
//                                             {certs.map((cert, index) => (
//                                                 <div key={index}>
//                                                     <a href={cert} target="_blank" rel="noopener noreferrer" style={{ color: '#007BFF' }}>
//                                                         Certificate {index + 1}
//                                                     </a>
//                                                 </div>
//                                             ))}
//                                         </div>
//                                     </div>
//                                 ))
//                             ) : (
//                                 <p>No certifications available</p>
//                             )}
//                         </div>

//                                 <p><strong>Submissions:</strong></p>
//                                 {selectedApplicant.submissions && selectedApplicant.submissions.length > 0 ? (
//                                     selectedApplicant.submissions.map((submission, index) => (
//                                         <div
//                                             key={submission.id}
//                                             style={{
//                                                 marginBottom: '20px',
//                                                 padding: '10px',
//                                                 border: '1px solid #ccc',
//                                                 borderRadius: '5px',
//                                             }}
//                                         >
//                                             <div>
//                                                 <video width="100%" controls style={{ margin: '10px 0' }}>
//                                                     <source src={submission.demoVideoLink} type="video/mp4" />
//                                                     Your browser does not support the video tag.
//                                                 </video>
//                                             </div>
//                                             <a
//                                                 href={submission.liveDemoLink}
//                                                 target="_blank"
//                                                 rel="noopener noreferrer"
//                                                 style={{ color: '#007BFF', fontWeight: 'bold' }}
//                                             >
//                                                 Live Demo Link: Demo {index + 1}
//                                             </a>

//                                             <p>CSS Score: {submission.scores?.css || 'N/A'}</p>
//                                             <p>HTML Score: {submission.scores?.html || 'N/A'}</p>
//                                             <p>JavaScript Score: {submission.scores?.javascript || 'N/A'}</p>
//                                         </div>
//                                     ))
//                                 ) : (
//                                     <p>No submissions available</p>
//                                 )}

//                             <h4>Send Email to Applicant</h4>
//                             <input
//                                 type="text"
//                                 placeholder="Email Subject"
//                                 value={emailSubject}
//                                 onChange={(e) => setEmailSubject(e.target.value)}
//                                 style={{
//                                     width: '100%',
//                                     padding: '10px',
//                                     marginBottom: '10px',
//                                     borderRadius: '5px',
//                                 }}
//                             />
//                                 <textarea
//                                 placeholder="Email Body"
//                                 value={emailBody}
//                                 onChange={(e) => setEmailBody(e.target.value)}
//                                 rows="4"
//                                 style={{
//                                     width: '100%',
//                                     padding: '10px',
//                                     borderRadius: '5px',
//                                     marginBottom: '10px',
//                                 }}
//                             />
//                                 <button
//                                 onClick={handleEmailSend}
//                                 style={{
//                                     padding: '10px 15px',
//                                     backgroundColor: '#007BFF',
//                                     color: '#fff',
//                                     border: 'none',
//                                     borderRadius: '5px',
//                                     cursor: 'pointer',
//                                 }}
//                             >
//                                 Send Email
//                             </button>

//                             <button
//                                 onClick={handleCloseApplicantModal}
//                                 style={{
//                                     padding: '10px 15px',
//                                     backgroundColor: '#DC3545',
//                                     color: '#fff',
//                                     border: 'none',
//                                     borderRadius: '5px',
//                                     cursor: 'pointer',
//                                     marginLeft: '10px',
//                                 }}
//                             >
//                                 Close
//                             </button>
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             ) : (
//                 <p>Loading employer details...</p>
//             )}
//         </div>
//     );
// };

// export default EmployerProfile;

import React, { useState, useEffect } from "react";
import { db, auth, storage } from "../firebase";
import { doc, getDoc, updateDoc, collection, query, where, getDocs, deleteDoc, addDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { onSnapshot } from "firebase/firestore";
import "../styles.css";
import { Link } from "react-router-dom";
import { FaUser, FaBriefcase, FaSearch, FaFileAlt, FaEye, FaBell, FaPlus, FaSignOutAlt } from "react-icons/fa";
const EmployerProfile = () => {
    const [employer, setEmployer] = useState(null);
    const [jobPosts, setJobPosts] = useState([]);
    const [applicants, setApplicants] = useState({});
    const [selectedJob, setSelectedJob] = useState(null);
    const [selectedApplicant, setSelectedApplicant] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [emailSubject, setEmailSubject] = useState("");
    const [emailBody, setEmailBody] = useState("");
    const [hiredApplicants, setHiredApplicants] = useState({});
    const [filterCriteria, setFilterCriteria] = useState("name");
    const [filterOrder, setFilterOrder] = useState("asc");
    const [showHiredApplicants, setShowHiredApplicants] = useState(false);
    const [showModal, setShowModal] = useState(false);
    
    const [editedData, setEditedData] = useState({
        industry: "",
        location: "",
        description: "",
        phone: "",
        contactPerson: "",
    });
    const [profilePic, setProfilePic] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportData, setReportData] = useState({
    violationType: '',
    details: ''
    });
    const [reportError, setReportError] = useState('');
    const [reportSubmitting, setReportSubmitting] = useState(false);
    const [reportSuccess, setReportSuccess] = useState(false);


    const handleSubmitReport = async () => {
        // Reset error state
        setReportError('');
      
        // Validate inputs
        if (!reportData.violationType) {
          setReportError('Please select a violation type.');
          return;
        }
      
        if (!reportData.details || reportData.details.trim().length < 10) {
          setReportError('Please provide detailed information about the violation (minimum 10 characters).');
          return;
        }
      
        // Validate applicant
        if (!selectedApplicant || !selectedApplicant.id) {
          setReportError('No applicant selected for reporting.');
          return;
        }
      
        try {
          setReportSubmitting(true);
      
          // Reference to the "job_reports" collection
          const reportsRef = collection(db, "job_reports");
          const userId = auth.currentUser.uid;
      
          // Add new report document
          console.log('Submitting report:', {
            applicantId: selectedApplicant.id,
            applicantName: selectedApplicant.name,
            applicantEmail: selectedApplicant.email,
            violationType: reportData.violationType,
            details: reportData.details,
            reportedBy: userId,
            reportedAt: new Date().toISOString(),
            status: 'pending'
          });
          await addDoc(reportsRef, {
            applicantId: selectedApplicant.id,
            applicantName: selectedApplicant.name,
            applicantEmail: selectedApplicant.email,
            violationType: reportData.violationType,
            details: reportData.details,
            reportedBy: userId || 'anonymous', // Replace with actual current user info
            reportedAt: new Date().toISOString(), // Or use Timestamp.now() for Firestore timestamps
            status: 'pending'
          });
      
          // Simulate API call or server processing
          await new Promise(resolve => setTimeout(resolve, 1000));
      
          // Show success message
          setReportSuccess(true);
      
          // Reset form and close modal after a delay
          setTimeout(() => {
            setReportData({ violationType: '', details: '' });
            setReportSuccess(false);
            setShowReportModal(false);
          }, 2000);
      
        } catch (error) {
          console.error('Error submitting report:', error);
          setReportError('Failed to submit report. Please try again.');
        } finally {
          setReportSubmitting(false);
        }
      };
      
    useEffect(() => {
        const fetchEmployerData = async () => {
            if (auth.currentUser) {
                const employerRef = doc(db, "employers", auth.currentUser.uid);
                const employerSnap = await getDoc(employerRef);
                if (employerSnap.exists()) {
                    setEmployer(employerSnap.data());
                    setEditedData({
                        industry: employerSnap.data().industry,
                        location: employerSnap.data().location,
                        description: employerSnap.data().description,
                        phone: employerSnap.data().phone,
                        contactPerson: employerSnap.data().contactPerson || "",
                    });
                    setProfilePic(employerSnap.data().profilePic || "");
                } else {
                    console.log("No employer data found.");
                }
            }
        };

        const fetchJobPosts = async () => {
            if (auth.currentUser) {
                const jobsRef = collection(db, "jobs");
                const q = query(jobsRef, where("employerId", "==", auth.currentUser.uid));
                const querySnapshot = await getDocs(q);
                setJobPosts(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
            }
        };

        fetchEmployerData();
        fetchJobPosts();
    }, []);

    useEffect(() => {
        const unsubscribeMap = {};
    
        jobPosts.forEach((job) => {
            const applicationsRef = collection(db, "jobs", job.id, "applications");
    
            // Listen for real-time changes
            const unsubscribe = onSnapshot(applicationsRef, (snapshot) => {
                const applicantsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    
                setApplicants((prev) => ({
                    ...prev,
                    [job.id]: applicantsData,
                }));
            });
    
            unsubscribeMap[job.id] = unsubscribe;

            // Fetch hired applicants
            const fetchHiredApplicants = async () => {
                try {
                    const hiredRef = collection(db, "employers", auth.currentUser.uid, "hired");
                    const hiredDocRef = doc(hiredRef, job.id);
                    const hiredDocSnap = await getDoc(hiredDocRef);
                    
                    if (hiredDocSnap.exists()) {
                        setHiredApplicants(prev => ({
                            ...prev,
                            [job.id]: hiredDocSnap.data().applicants || []
                        }));
                    }
                } catch (error) {
                    console.error("Error fetching hired applicants:", error);
                }
            };

            fetchHiredApplicants();
        });
    
        return () => {
            Object.values(unsubscribeMap).forEach((unsubscribe) => unsubscribe());
        };
    }, [jobPosts]);

    const handleJobClick = (job) => {
        setSelectedJob(job.id);
        setShowHiredApplicants(false);
    };
    
    const handleApplicantClick = (applicant) => {
        setSelectedApplicant(applicant);
    };

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleSaveClick = async () => {
        if (auth.currentUser) {
            const employerRef = doc(db, "employers", auth.currentUser.uid);
            await updateDoc(employerRef, editedData);
            setEmployer((prev) => ({ ...prev, ...editedData }));
            setIsEditing(false);
        }
    };

    const handleProfilePicChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setUploading(true);
            const storageRef = ref(storage, `profile_pictures/${auth.currentUser.uid}`);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);

            setProfilePic(downloadURL);
            await updateDoc(doc(db, "employers", auth.currentUser.uid), { profilePic: downloadURL });

            setUploading(false);
        }
    };

    const handleDeleteJob = async (jobId) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this job post?");
        if (confirmDelete) {
            await deleteDoc(doc(db, "jobs", jobId));
            setJobPosts((prev) => prev.filter((job) => job.id !== jobId));
            alert("Job post deleted successfully!");
        }
    };

    const handleCloseApplicantModal = () => {
        setSelectedApplicant(null);
    };

    const handleChange = (e) => {
        setEditedData({ ...editedData, [e.target.name]: e.target.value });
    };

    const handleEmailSend = async () => {
        if (!selectedApplicant || !selectedJob || !employer) {
            console.error("Missing required data (applicant, job, or employer).");
            return;
        }

        try {
            // Reference to the applicant's notifications subcollection
            const notificationsRef = collection(db, "applicants", selectedApplicant.id, "notifications");

            // Create the notification object with company name, email subject, and email body
            const newNotification = {
                jobId: selectedJob,
                companyName: employer.companyName,
                subject: emailSubject,
                message: emailBody,
                timestamp: new Date(),
                status: "unread",
            };

            // Add the notification to Firestore
            await addDoc(notificationsRef, newNotification);

            console.log("Notification added successfully!");

            // Show success alert
            alert("Email sent successfully!");

            // Close the applicant submission modal
            setSelectedApplicant(null);
            
        } catch (error) {
            console.error("Error sending email or updating Firestore:", error);
            alert("Failed to send email. Please try again.");
        }
    };

    // New functions for requirements

    const handleHireApplicant = async () => {
        if (!selectedApplicant || !selectedJob) {
            console.error("No applicant or job selected");
            return;
        }
    
        try {
            // Add to hired applicants subcollection
            const hiredRef = doc(db, "employers", auth.currentUser.uid, "hired", selectedJob);
            
            // Get current hired applicants if they exist
            const hiredDoc = await getDoc(hiredRef);
            let currentHired = [];
    
            if (hiredDoc.exists()) {
                currentHired = hiredDoc.data().applicants || [];
            }
    
            // Check if applicant is already hired
            if (!currentHired.some(app => app.id === selectedApplicant.id)) {
                currentHired.push(selectedApplicant);
    
                // Update Firestore: Add to 'hired'
                await setDoc(hiredRef, { applicants: currentHired }, { merge: true });
    
                // ✅ Delete applicant from jobs/{jobId}/applications
                const applicantRef = doc(db, "jobs", selectedJob, "applications", selectedApplicant.id);
                await deleteDoc(applicantRef);
    
                // Update local state
                setHiredApplicants(prev => ({
                    ...prev,
                    [selectedJob]: [...(prev[selectedJob] || []), selectedApplicant]
                }));
    
                alert(`${selectedApplicant.name} has been hired!`);
                setSelectedApplicant(null);
            } else {
                alert("This applicant has already been hired!");
            }
        } catch (error) {
            console.error("Error hiring applicant:", error);
            alert("Failed to hire applicant. Please try again.");
        }
    };
    

    const handleRejectApplicant = async () => {
        if (!selectedApplicant || !selectedJob) {
            console.error("No applicant or job selected");
            return;
        }

        const confirmReject = window.confirm(`Are you sure you want to reject ${selectedApplicant.name}?`);
        if (confirmReject) {
            try {
                // Delete from applications subcollection
                await deleteDoc(doc(db, "jobs", selectedJob, "applications", selectedApplicant.id));
                
                // Update local state
                setApplicants(prev => ({
                    ...prev,
                    [selectedJob]: prev[selectedJob].filter(app => app.id !== selectedApplicant.id)
                }));
                
                alert(`${selectedApplicant.name} has been rejected.`);
                setSelectedApplicant(null);
            } catch (error) {
                console.error("Error rejecting applicant:", error);
                alert("Failed to reject applicant. Please try again.");
            }
        }
    };

    const handleCloseJob = async (jobId) => {
        const confirmClose = window.confirm("Are you sure you want to close this job post? It will no longer be visible to applicants.");
        if (confirmClose) {
            try {
                await updateDoc(doc(db, "jobs", jobId), { status: "closed" });
                
                // Update local state
                setJobPosts(prev => prev.map(job => 
                    job.id === jobId ? { ...job, status: "closed" } : job
                ));
                
                alert("Job post has been closed.");
            } catch (error) {
                console.error("Error closing job:", error);
                alert("Failed to close job. Please try again.");
            }
        }
    };

    const toggleHiredApplicants = (jobId) => {
        setSelectedJob(jobId);
        setShowHiredApplicants(!showHiredApplicants);
    };

    const getSortedApplicants = (jobId) => {
        if (!applicants[jobId]) return [];
        
        return [...applicants[jobId]].sort((a, b) => {
            if (filterCriteria === "name") {
                return filterOrder === "asc" 
                    ? a.name.localeCompare(b.name)
                    : b.name.localeCompare(a.name);
            }
            // Add more sorting criteria as needed
            return 0;
        });
    };
    const ApplicantDetailsModal = ({ cert, onClose }) => {
  if (!cert) return null;


  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '400px'
      }}>
        <h4>Certification Details</h4>
        <p><strong>Name:</strong> {cert.name}</p>
        <p><strong>Issuer:</strong> {cert.issuer}</p>
        <p><strong>Issue Date:</strong> {cert.issueDate}</p>
        <p><strong>Expiry Date:</strong> {cert.expiryDate}</p>
        <p><strong>Credential ID:</strong> {cert.credentialID}</p>
        {cert.imageURL && (
          <img
            src={cert.imageURL}
            alt="cert"
            style={{ maxWidth: "100%", marginTop: "10px", borderRadius: "5px" }}
          />
        )}
        <button onClick={onClose} style={{ marginTop: '15px' }}>Close</button>
      </div>
    </div>
  );
};

      
      
    return (
        <div className="employer-profile" style={{ 
            maxWidth: "1200px", 
            margin: "0 auto", 
            padding: "20px", 
            fontFamily: "Arial, sans-serif" 
        }}>
            <h2 style={{ 
                marginTop: "20px", 
                color: "#333", 
                textAlign: "center",
                fontSize: "28px",
                fontWeight: "600",
                marginBottom: "30px",
                marginTop:"5%" 
            }}>Employer Dashboard</h2>

            {employer ? (
                <div className="profile-container" style={{ 
                    display: "flex", 
                    flexWrap: "wrap", 
                    gap: "30px" 
                }}>
                    {/* Profile Section */}
                    <div className="profile-details" style={{ 
                        flex: "1", 
                        minWidth: "300px", 
                        backgroundColor: "#fff", 
                        borderRadius: "10px", 
                        padding: "25px", 
                        boxShadow: "0 2px 10px rgba(0,0,0,0.1)" 
                    }}>
                        <div style={{ 
                            display: "flex", 
                            alignItems: "center", 
                            marginBottom: "20px" 
                        }}>
                            <div className="profile-picture" style={{ 
                                position: "relative", 
                                marginRight: "20px" 
                            }}>
                                <label htmlFor="profile-pic-upload" style={{ cursor: "pointer" }}>
                                    <div style={{
                                        width: "100px",
                                        height: "100px",
                                        borderRadius: "50%",
                                        overflow: "hidden",
                                        border: "3px solid #3498db",
                                        position: "relative"
                                    }}>
                                        <img 
                                            src={profilePic || "/default-profile.png"} 
                                            alt="Profile" 
                                            style={{ 
                                                width: "100%", 
                                                height: "100%", 
                                                objectFit: "cover" 
                                            }} 
                                        />
                                        {uploading && (
                                            <div style={{
                                                position: "absolute",
                                                top: 0,
                                                left: 0,
                                                width: "100%",
                                                height: "100%",
                                                backgroundColor: "rgba(0,0,0,0.5)",
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                color: "#fff"
                                            }}>
                                                Uploading...
                                            </div>
                                        )}
                                    </div>
                                    <div style={{
                                        position: "absolute",
                                        bottom: "0",
                                        right: "0",
                                        backgroundColor: "#3498db",
                                        width: "30px",
                                        height: "30px",
                                        borderRadius: "50%",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        color: "#fff",
                                        fontSize: "18px"
                                    }}>
                                        +
                                    </div>
                                </label>
                                <input 
                                    type="file" 
                                    id="profile-pic-upload" 
                                    style={{ display: "none" }} 
                                    onChange={handleProfilePicChange} 
                                />
                            </div>
                            <div>
                                <h3 style={{ 
                                    fontSize: "24px", 
                                    fontWeight: "600", 
                                    color: "#333", 
                                    margin: "0 0 5px 0" 
                                }}>
                                    {employer.companyName}
                                </h3>
                                <div style={{ 
                                    display: "flex", 
                                    alignItems: "center", 
                                    color: "#666" 
                                }}>
                                    <span style={{ marginRight: "10px" }}>
                                        {employer.industry}
                                    </span>
                                    •
                                    <span style={{ marginLeft: "10px" }}>
                                        {employer.location}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginBottom: "20px" }}>
                            <h4 style={{ 
                                fontSize: "18px", 
                                fontWeight: "600", 
                                color: "#333", 
                                marginBottom: "10px",
                                paddingBottom: "5px",
                                borderBottom: "1px solid #eee"
                            }}>
                                Company Details
                            </h4>
                            
                            <div style={{ marginBottom: "10px" }}>
                                <div style={{ fontWeight: "600", marginBottom: "3px" }}>Industry:</div>
                                {isEditing ? (
                                    <input 
                                        type="text" 
                                        name="industry" 
                                        value={editedData.industry} 
                                        onChange={handleChange} 
                                        style={{ 
                                            width: "100%", 
                                            padding: "8px", 
                                            borderRadius: "5px", 
                                            border: "1px solid #ddd" 
                                        }} 
                                    />
                                ) : (
                                    <div>{employer.industry}</div>
                                )}
                            </div>
                            
                            <div style={{ marginBottom: "10px" }}>
                                <div style={{ fontWeight: "600", marginBottom: "3px" }}>Location:</div>
                                {isEditing ? (
                                    <input 
                                        type="text" 
                                        name="location" 
                                        value={editedData.location} 
                                        onChange={handleChange} 
                                        style={{ 
                                            width: "100%", 
                                            padding: "8px", 
                                            borderRadius: "5px", 
                                            border: "1px solid #ddd" 
                                        }} 
                                    />
                                ) : (
                                    <div>{employer.location}</div>
                                )}
                            </div>
                            
                            <div style={{ marginBottom: "10px" }}>
                                <div style={{ fontWeight: "600", marginBottom: "3px" }}>Description:</div>
                                {isEditing ? (
                                    <textarea 
                                        name="description" 
                                        value={editedData.description} 
                                        onChange={handleChange} 
                                        style={{ 
                                            width: "100%", 
                                            padding: "8px", 
                                            borderRadius: "5px", 
                                            border: "1px solid #ddd",
                                            minHeight: "100px",
                                            resize: "vertical"
                                        }} 
                                    />
                                ) : (
                                    <div style={{ 
                                        lineHeight: "1.5",
                                        color: "#555" 
                                    }}>{employer.description}</div>
                                )}
                            </div>
                        </div>

                        <div style={{ marginBottom: "20px" }}>
                            <h4 style={{ 
                                fontSize: "18px", 
                                fontWeight: "600", 
                                color: "#333", 
                                marginBottom: "10px",
                                paddingBottom: "5px",
                                borderBottom: "1px solid #eee"
                            }}>
                                Contact Information
                            </h4>
                            
                            <div style={{ marginBottom: "10px" }}>
                                <div style={{ fontWeight: "600", marginBottom: "3px" }}>Contact Person:</div>
                                {isEditing ? (
                                    <input 
                                        type="text" 
                                        name="contactPerson" 
                                        value={editedData.contactPerson} 
                                        onChange={handleChange} 
                                        style={{ 
                                            width: "100%", 
                                            padding: "8px", 
                                            borderRadius: "5px", 
                                            border: "1px solid #ddd" 
                                        }} 
                                    />
                                ) : (
                                    <div>{employer.contactPerson || "Not specified"}</div>
                                )}
                            </div>
                            
                            <div style={{ marginBottom: "10px" }}>
                                <div style={{ fontWeight: "600", marginBottom: "3px" }}>Email:</div>
                                <div>{employer.email}</div>
                            </div>
                            
                            <div style={{ marginBottom: "10px" }}>
                                <div style={{ fontWeight: "600", marginBottom: "3px" }}>Phone:</div>
                                {isEditing ? (
                                    <input 
                                        type="text" 
                                        name="phone" 
                                        value={editedData.phone} 
                                        onChange={handleChange} 
                                        style={{ 
                                            width: "100%", 
                                            padding: "8px", 
                                            borderRadius: "5px", 
                                            border: "1px solid #ddd" 
                                        }} 
                                    />
                                ) : (
                                    <div>{employer.phone}</div>
                                )}
                            </div>
                        </div>

                        {isEditing ? (
                            <button 
                                className="save-btn" 
                                onClick={handleSaveClick}
                                style={{
                                    backgroundColor: "#2ecc71",
                                    color: "#fff",
                                    border: "none",
                                    padding: "10px 15px",
                                    borderRadius: "5px",
                                    cursor: "pointer",
                                    fontWeight: "600",
                                    width: "100%",
                                    fontSize: "16px"
                                }}
                            >
                                Save Changes
                            </button>
                        ) : (
                            <button 
                                className="edit-btn" 
                                onClick={handleEditClick}
                                style={{
                                    backgroundColor: "#3498db",
                                    color: "#fff",
                                    border: "none",
                                    padding: "10px 15px",
                                    borderRadius: "5px",
                                    cursor: "pointer",
                                    fontWeight: "600",
                                    width: "100%",
                                    fontSize: "16px"
                                }}
                            >
                                Edit Profile
                            </button>
                        )}
                    </div>

                    {/* Jobs Section */}
                    <div className="jobs-section" style={{ 
                        flex: "2", 
                        minWidth: "400px", 
                        backgroundColor: "#fff", 
                        borderRadius: "10px", 
                        padding: "25px", 
                        boxShadow: "0 2px 10px rgba(0,0,0,0.1)" 
                    }}>
                        <h3 style={{ 
                            fontSize: "22px", 
                            fontWeight: "600", 
                            color: "#333", 
                            marginBottom: "20px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                        }}>
                            <span>Active Job Listings</span>
                            {/* <a href="/employer/post-job" style={{
                                fontSize: "14px",
                                backgroundColor: "#3498db",
                                color: "#fff",
                                textDecoration: "none",
                                padding: "8px 15px",
                                borderRadius: "5px",
                                display: "inline-block"
                            }}>
                                + Post New Job
                            </a> */}
                            <Link to="/employer/post-job" style={{
                                fontSize: "14px",
                                backgroundColor: "#3498db",
                                color: "#fff",
                                textDecoration: "none",
                                padding: "5px 15px",
                                borderRadius: "5px",
                                display: "inline-block"
                            }}>
                                                {/* <FaUser /> */}
                                                <span>+ Post New Job</span>
                                              </Link>
                        </h3>

                        {jobPosts.length > 0 ? (
                            <ul className="job-list" style={{ 
                                listStyle: "none", 
                                padding: "0", 
                                margin: "0" 
                            }}>
                                {jobPosts.map((job) => (
                                    <li 
                                        key={job.id} 
                                        className="job-card" 
                                        style={{ 
                                            marginBottom: "20px", 
                                            backgroundColor: "#f9f9f9", 
                                            borderRadius: "8px", 
                                            padding: "20px", 
                                            borderLeft: job.status === "closed" ? "4px solid #e74c3c" : "4px solid #3498db" 
                                        }}
                                    >
                                        <div style={{ marginBottom: "15px", display: "flex", justifyContent: "space-between" }}>
                                            <h4 style={{ 
                                                margin: "0", 
                                                fontSize: "18px", 
                                                fontWeight: "600",
                                                color: "#333"
                                            }}>
                                                {job.title} 
                                                {job.status === "closed" && (
                                                    <span style={{ 
                                                        color: "#e74c3c", 
                                                        fontSize: "14px", 
                                                        fontWeight: "normal", 
                                                        marginLeft: "10px",
                                                        padding: "3px 8px",
                                                        backgroundColor: "#fde2e2",
                                                        borderRadius: "4px"
                                                    }}>
                                                        Closed
                                                    </span>
                                                )}
                                            </h4>
                                            <div style={{ display: "flex", gap: "10px" }}>
                                                <button 
                                                    onClick={() => handleCloseJob(job.id)} 
                                                    disabled={job.status === "closed"}
                                                    style={{
                                                        padding: "5px 10px",
                                                        backgroundColor: job.status === "closed" ? "#ccc" : "#e74c3c",
                                                        color: "#fff",
                                                        border: "none",
                                                        borderRadius: "4px",
                                                        cursor: job.status === "closed" ? "not-allowed" : "pointer",
                                                        fontSize: "12px"
                                                    }}
                                                >
                                                    Close Job
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteJob(job.id)}
                                                    style={{
                                                        padding: "5px 10px",
                                                        backgroundColor: "#7f8c8d",
                                                        color: "#fff",
                                                        border: "none",
                                                        borderRadius: "4px",
                                                        cursor: "pointer",
                                                        fontSize: "12px"
                                                    }}
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div style={{ 
                                            display: "flex", 
                                            alignItems: "center", 
                                            marginBottom: "10px",
                                            color: "#666",
                                            fontSize: "14px"
                                        }}>
                                            <span style={{ marginRight: "15px" }}>
                                                📍 {job.location}
                                            </span>
                                            {job.salary && (
                                                <span>
                                                    💰 {job.salary}
                                                </span>
                                            )}
                                        </div>
                                        
                                        <p style={{ 
                                            margin: "0 0 15px 0", 
                                            color: "#555",
                                            fontSize: "14px",
                                            lineHeight: "1.5"
                                        }}>
                                            {job.description?.length > 150 
                                                ? `${job.description.substring(0, 150)}...` 
                                                : job.description}
                                        </p>
                                        
                                        <div className="job-stats" style={{ 
                                            display: "flex", 
                                            marginBottom: "15px",
                                            fontSize: "13px"
                                        }}>
                                            <div style={{ 
                                                marginRight: "15px", 
                                                backgroundColor: "#eaf2fd", 
                                                padding: "5px 10px", 
                                                borderRadius: "4px", 
                                                color: "#3498db" 
                                            }}>
                                                👥 {applicants[job.id]?.length || 0} Applicants
                                            </div>
                                            <div style={{ 
                                                backgroundColor: "#e2f7eb", 
                                                padding: "5px 10px", 
                                                borderRadius: "4px", 
                                                color: "#27ae60" 
                                            }}>
                                                ✅ {hiredApplicants[job.id]?.length || 0} Hired
                                            </div>
                                        </div>

                                        <div className="job-buttons" style={{ 
                                            display: "flex", 
                                            gap: "10px",
                                            flexWrap: "wrap" 
                                        }}>
                                            <button 
                                                onClick={() => handleJobClick(job)}
                                                style={{
                                                    padding: "8px 12px",
                                                    backgroundColor: selectedJob === job.id && !showHiredApplicants ? "#2c3e50" : "#3498db",
                                                    color: "#fff",
                                                    border: "none",
                                                    borderRadius: "4px",
                                                    cursor: "pointer",
                                                    flex: "1"
                                                }}
                                            >
                                                View Applicants
                                            </button>
                                            <button 
                                                onClick={() => toggleHiredApplicants(job.id)}
                                                style={{
                                                    padding: "8px 12px",
                                                    backgroundColor: showHiredApplicants && selectedJob === job.id ? "#2c3e50" : "#2ecc71",
                                                    color: "#fff",
                                                    border: "none",
                                                    borderRadius: "4px",
                                                    cursor: "pointer",
                                                    flex: "1"
                                                }}
                                            >
                                                View Hired
                                            </button>
                                        </div>

                                        {selectedJob === job.id && !showHiredApplicants && (
                                            <div id="JOBlist" style={{ 
                                                marginTop: "15px", 
                                                backgroundColor: "#fff",
                                                borderRadius: "6px",
                                                padding: "15px",
                                                border: "1px solid #e1e1e1"
                                            }}>
                                                <div style={{ 
                                                    display: "flex", 
                                                    justifyContent: "space-between", 
                                                    alignItems: "center",
                                                    marginBottom: "15px" 
                                                }}>
                                                    <h5 style={{ 
                                                        margin: "0", 
                                                        fontSize: "16px", 
                                                        fontWeight: "600",
                                                        color: "#333"
                                                    }}>
                                                        Applicants ({applicants[job.id]?.length || 0})
                                                    </h5>
                                                    <div className="filter-controls" style={{ 
                                                        display: "flex", 
                                                        gap: "10px",
                                                        alignItems: "center" 
                                                    }}>
                                                        <select 
                                                            value={filterCriteria}
                                                            onChange={(e) => setFilterCriteria(e.target.value)}
                                                            style={{
                                                                padding: "6px",
                                                                borderRadius: "4px",
                                                                border: "1px solid #ddd",
                                                                fontSize: "13px"
                                                            }}
                                                        >
                                                            <option value="name">Name</option>
                                                            {/* Add more filter options as needed */}
                                                        </select>
                                                        <select 
                                                            value={filterOrder}
                                                            onChange={(e) => setFilterOrder(e.target.value)}
                                                            style={{
                                                                padding: "6px",
                                                                borderRadius: "4px",
                                                                border: "1px solid #ddd",
                                                                fontSize: "13px"
                                                            }}
                                                        >
                                                            <option value="asc">A-Z</option>
                                                            <option value="desc">Z-A</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div style={{
                                                    maxHeight: '300px',
                                                    overflowY: 'auto',
                                                    borderRadius: '6px',
                                                }} className="applicant-list">
                                                    {applicants[job.id] && applicants[job.id].length > 0 ? (
                                                        getSortedApplicants(job.id).map((applicant) => (
                                                            <div
                                                                key={applicant.id}
                                                                style={{
                                                                    padding: '15px',
                                                                    marginBottom: '10px',
                                                                    backgroundColor: '#f9f9f9',
                                                                    borderRadius: '6px',
                                                                    cursor: 'pointer',
                                                                    display: 'flex',
                                                                    justifyContent: 'space-between',
                                                                    alignItems: 'center',
                                                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                                                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                                                    border: '1px solid #eee',
                                                                    ":hover": {
                                                                        transform: 'translateY(-2px)',
                                                                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                                                    }
                                                                }}
                                                            >
                                                                <div style={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    flex: '1'
                                                                }}>
                                                                    {applicant.profilePicURL ? (
                                                                        <img 
                                                                            src={applicant.profilePicURL} 
                                                                            alt={applicant.name} 
                                                                            style={{
                                                                                width: '40px',
                                                                                height: '40px',
                                                                                borderRadius: '50%',
                                                                                objectFit: 'cover',
                                                                                marginRight: '15px',
                                                                                border: '2px solid #3498db'
                                                                            }}
                                                                        />
                                                                    ) : (
                                                                        <div style={{
                                                                            width: '40px',
                                                                            height: '40px',
                                                                            borderRadius: '50%',
                                                                            backgroundColor: '#3498db',
                                                                            display: 'flex',
                                                                            justifyContent: 'center',
                                                                            alignItems: 'center',
                                                                            color: '#fff',
                                                                            fontWeight: 'bold',
                                                                            marginRight: '15px',
                                                                            fontSize: '16px'
                                                                        }}>
                                                                            {applicant.name ? applicant.name[0].toUpperCase() : 'A'}
                                                                        </div>
                                                                    )}
                                                                    <div>
                                                                        <div style={{
                                                                            fontWeight: '600',
                                                                            fontSize: '15px',
                                                                            color: '#333',
                                                                            marginBottom: '3px'
                                                                        }}>{applicant.name}</div>
                                                                        <div style={{
                                                                            fontSize: '13px',
                                                                            color: '#666'
                                                                        }}>{applicant.email}</div>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <button 
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleApplicantClick(applicant);
                                                                        }}
                                                                        style={{
                                                                            padding: '6px 12px',
                                                                            backgroundColor: '#3498db',
                                                                            color: '#fff',
                                                                            border: 'none',
                                                                            borderRadius: '4px',
                                                                            cursor: 'pointer',
                                                                            fontSize: '13px',
                                                                            fontWeight: '600'
                                                                        }}
                                                                    >
                                                                        View Details
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div style={{
                                                            padding: '20px',
                                                            textAlign: 'center',
                                                            color: '#777',
                                                            backgroundColor: '#f9f9f9',
                                                            borderRadius: '6px',
                                                            border: '1px dashed #ddd'
                                                        }}>
                                                            <div style={{ fontSize: '24px', marginBottom: '10px' }}>👥</div>
                                                            <p style={{ margin: '0' }}>No applicants for this position yet.</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {selectedJob === job.id && showHiredApplicants && (
                                            <div id="HiredList" style={{ 
                                                marginTop: '15px', 
                                                backgroundColor: '#fff',
                                                borderRadius: '6px',
                                                padding: '15px',
                                                border: '1px solid #e1e1e1'
                                            }}>
                                                <h5 style={{ 
                                                    margin: '0 0 15px 0', 
                                                    fontSize: '16px', 
                                                    fontWeight: '600',
                                                    color: '#333'
                                                }}>
                                                    Hired Applicants ({hiredApplicants[job.id]?.length || 0})
                                                </h5>
                                                <div style={{
                                                    maxHeight: '300px',
                                                    overflowY: 'auto',
                                                    borderRadius: '6px',
                                                }} className="hired-applicant-list">
                                                    {hiredApplicants[job.id] && hiredApplicants[job.id].length > 0 ? (
                                                        hiredApplicants[job.id].map((applicant) => (
                                                            <div
                                                                key={applicant.id}
                                                                style={{
                                                                    padding: '15px',
                                                                    marginBottom: '10px',
                                                                    backgroundColor: '#e6ffe6',
                                                                    border: '1px solid #c1e7c1',
                                                                    borderRadius: '6px',
                                                                    cursor: 'pointer',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                                                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                                                    ":hover": {
                                                                        transform: 'translateY(-2px)',
                                                                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                                                    }
                                                                }}
                                                                onClick={() => handleApplicantClick(applicant)}
                                                            >
                                                                {applicant.profilePicURL ? (
                                                                    <img 
                                                                        src={applicant.profilePicURL} 
                                                                        alt={applicant.name} 
                                                                        style={{
                                                                            width: '40px',
                                                                            height: '40px',
                                                                            borderRadius: '50%',
                                                                            objectFit: 'cover',
                                                                            marginRight: '15px',
                                                                            border: '2px solid #27ae60'
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <div style={{
                                                                        width: '40px',
                                                                        height: '40px',
                                                                        borderRadius: '50%',
                                                                        backgroundColor: '#27ae60',
                                                                        display: 'flex',
                                                                        justifyContent: 'center',
                                                                        alignItems: 'center',
                                                                        color: '#fff',
                                                                        fontWeight: 'bold',
                                                                        marginRight: '15px',
                                                                        fontSize: '16px'
                                                                    }}>
                                                                        {applicant.name ? applicant.name[0].toUpperCase() : 'A'}
                                                                    </div>
                                                                )}
                                                                <div>
                                                                    <div style={{
                                                                        fontWeight: '600',
                                                                        fontSize: '15px',
                                                                        color: '#333',
                                                                        marginBottom: '3px'
                                                                    }}>{applicant.name}</div>
                                                                    <div style={{
                                                                        fontSize: '13px',
                                                                        color: '#666'
                                                                    }}>{applicant.email}</div>
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div style={{
                                                            padding: '20px',
                                                            textAlign: 'center',
                                                            color: '#777',
                                                            backgroundColor: '#f9f9f9',
                                                            borderRadius: '6px',
                                                            border: '1px dashed #ddd'
                                                        }}>
                                                            <div style={{ fontSize: '24px', marginBottom: '10px' }}>✅</div>
                                                            <p style={{ margin: '0' }}>No hired applicants for this position yet.</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div style={{
                                padding: '30px',
                                textAlign: 'center',
                                backgroundColor: '#f9f9f9',
                                borderRadius: '8px',
                                border: '1px dashed #ddd'
                            }}>
                                <div style={{ fontSize: '32px', marginBottom: '15px' }}>📋</div>
                                <p style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#555' }}>You haven't posted any jobs yet.</p>
                                {/* <a href="/post-job" style={{
                                    backgroundColor: '#3498db',
                                    color: '#fff',
                                    textDecoration: 'none',
                                    padding: '10px 20px',
                                    borderRadius: '5px',
                                    display: 'inline-block',
                                    fontWeight: '600'
                                }}>
                                    Post Your First Job
                                </a> */}
                                <Link to="/employer/post-job" style={{
                                fontSize: "14px",
                                backgroundColor: "#3498db",
                                color: "#fff",
                                textDecoration: "none",
                                padding: "5px 15px",
                                borderRadius: "5px",
                                display: "inline-block"
                            }}>
                                                {/* <FaUser /> */}
                                                <span>Post Your First Job</span>
                                              </Link>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div style={{
                    padding: '40px',
                    textAlign: 'center',
                    backgroundColor: '#fff',
                    borderRadius: '10px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        margin: '0 auto 20px',
                        border: '4px solid #f3f3f3',
                        borderTop: '4px solid #3498db',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }}></div>
                    <p style={{ fontSize: '18px', color: '#777' }}>Loading employer details...</p>
                    <style>{`
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                    `}</style>
                </div>
            )}

            {/* Applicant Modal */}
            {selectedApplicant && (
                <div className="modal-overlay1" style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div className="modal-content1" style={{
                        backgroundColor: '#fff',
                        borderRadius: '10px',
                        width: '90%',
                        maxWidth: '700px',
                        maxHeight: '90vh',
                        overflow: 'auto',
                        boxShadow: '0 5px 20px rgba(0, 0, 0, 0.2)',
                        padding: '0'
                    }}>
                        <div style={{
                            padding: '20px',
                            borderBottom: '1px solid #eee',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            backgroundColor: '#f8f9fa',
                            borderTopLeftRadius: '10px',
                            borderTopRightRadius: '10px'
                        }}>
                            <h4 style={{
                                margin: 0,
                                fontSize: '20px',
                                fontWeight: '600',
                                color: '#333'
                            }}>Applicant Details</h4>
                            <button
                                onClick={handleCloseApplicantModal}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '24px',
                                    cursor: 'pointer',
                                    color: '#777'
                                }}
                            >
                                &times;
                            </button>
                        </div>

                        
                    <div style={{ 
                    display: 'flex',
                    justifyContent: 'flex-end',
                    padding: '10px 25px',
                    borderTop: '1px solid #eee',
                    backgroundColor: '#f8f9fa',
                    borderBottomLeftRadius: '10px',
                    borderBottomRightRadius: '10px'
                }}>
                    <button
                        onClick={() => setShowReportModal(true)}
                        style={{
                            backgroundColor: '#ff6b6b',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '8px 16px',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            transition: 'background-color 0.2s'
                        }}
                    >
                        <span style={{ marginRight: '8px' }}>⚠️</span>
                        Report Applicant
                    </button>
                </div>
                

{/* Report Modal */}
{showReportModal && (
    <div className="report-modal-overlay" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1100
    }}>
        <div className="report-modal-content" style={{
            backgroundColor: '#fff',
            borderRadius: '10px',
            width: '90%',
            maxWidth: '500px',
            boxShadow: '0 5px 20px rgba(0, 0, 0, 0.3)',
            padding: '0'
        }}>
            <div style={{
                padding: '15px 20px',
                borderBottom: '1px solid #eee',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#f8d7da',
                borderTopLeftRadius: '10px',
                borderTopRightRadius: '10px'
            }}>
                <h4 style={{
                    margin: 0,
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#721c24',
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    <span style={{ marginRight: '10px' }}>⚠️</span>
                    Report Guideline Violation
                </h4>
                <button
                    onClick={() => setShowReportModal(false)}
                    style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '22px',
                        cursor: 'pointer',
                        color: '#721c24'
                    }}
                >
                    &times;
                </button>
            </div>
            
            <div style={{ padding: '20px' }}>
                <p style={{ 
                    margin: '0 0 15px 0',
                    fontSize: '14px',
                    color: '#555',
                    lineHeight: '1.5'
                }}>
                    You are about to report <strong>{selectedApplicant.name}</strong> for violating our platform guidelines. 
                    Please provide specific details about the violation.
                </p>
                
                <div style={{ marginBottom: '15px' }}>
                    <label 
                        htmlFor="violation-type" 
                        style={{ 
                            display: 'block',
                            marginBottom: '5px',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#333'
                        }}
                    >
                        Violation Type:
                    </label>
                    <select 
                        id="violation-type"
                        value={reportData.violationType}
                        onChange={(e) => setReportData({...reportData, violationType: e.target.value})}
                        style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: '4px',
                            border: '1px solid #ddd',
                            fontSize: '14px',
                            color: '#333'
                        }}
                    >
                        <option value="">Select violation type</option>
                        <option value="false_information">False Information</option>
                        <option value="impersonation">Impersonation</option>
                        <option value="inappropriate_content">Inappropriate Content</option>
                        <option value="fake_credentials">Fake Credentials</option>
                        <option value="spam">Spam Application</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                    <label 
                        htmlFor="report-details" 
                        style={{ 
                            display: 'block',
                            marginBottom: '5px',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#333'
                        }}
                    >
                        Details:
                    </label>
                    <textarea 
                        id="report-details"
                        value={reportData.details}
                        onChange={(e) => setReportData({...reportData, details: e.target.value})}
                        placeholder="Please provide specific details about the violation..."
                        style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: '4px',
                            border: '1px solid #ddd',
                            fontSize: '14px',
                            minHeight: '120px',
                            resize: 'vertical',
                            color: '#333',
                            fontFamily: 'inherit'
                        }}
                    />
                </div>
                
                {reportError && (
                    <div style={{
                        backgroundColor: '#f8d7da',
                        color: '#721c24',
                        padding: '10px',
                        borderRadius: '4px',
                        marginBottom: '15px',
                        fontSize: '14px'
                    }}>
                        {reportError}
                    </div>
                )}
                
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between'
                }}>
                    <button
                        onClick={() => setShowReportModal(false)}
                        style={{
                            backgroundColor: '#f1f2f6',
                            color: '#555',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '10px 20px',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmitReport}
                        style={{
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '10px 20px',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <span style={{ marginRight: '5px' }}>📢</span>
                        Submit Report
                    </button>
                </div>
            </div>
        </div>
    </div>
)}
                        
                        
                        <div style={{ padding: '25px' }}>
                            {/* Profile and basic info */}
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'flex-start', 
                                marginBottom: '25px',
                                backgroundColor: '#f9f9f9',
                                borderRadius: '8px',
                                padding: '20px'
                            }}>
                                <div style={{ marginRight: '20px' }}>
                                    {selectedApplicant.profilePicURL ? (
                                        <img 
                                            src={selectedApplicant.profilePicURL} 
                                            alt="Profile" 
                                            style={{ 
                                                width: '100px', 
                                                height: '100px', 
                                                borderRadius: '50%',
                                                objectFit: 'cover',
                                                border: '3px solid #3498db'
                                            }} 
                                        />
                                    ) : (
                                        <div style={{
                                            width: '100px',
                                            height: '100px',
                                            borderRadius: '50%',
                                            backgroundColor: '#3498db',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            color: '#fff',
                                            fontWeight: 'bold',
                                            fontSize: '40px'
                                        }}>
                                            {selectedApplicant.name ? selectedApplicant.name[0].toUpperCase() : 'A'}
                                        </div>
                                    )}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{
                                        margin: '0 0 5px 0',
                                        fontSize: '24px',
                                        fontWeight: '600',
                                        color: '#333'
                                    }}>{selectedApplicant.name}</h3>
                                    <div style={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: '10px',
                                        marginBottom: '10px'
                                    }}>
                                        <div style={{
                                            backgroundColor: '#e3f2fd',
                                            color: '#1976d2',
                                            padding: '5px 10px',
                                            borderRadius: '4px',
                                            fontSize: '13px',
                                            fontWeight: '500'
                                        }}>
                                            {selectedApplicant.type || "Not specified"}
                                        </div>
                                        {selectedApplicant.status && (
                                            <div style={{
                                                backgroundColor: selectedApplicant.status === "Active" ? '#e8f5e9' : '#ffebee',
                                                color: selectedApplicant.status === "Active" ? '#388e3c' : '#d32f2f',
                                                padding: '5px 10px',
                                                borderRadius: '4px',
                                                fontSize: '13px',
                                                fontWeight: '500'
                                            }}>
                                                {selectedApplicant.status}
                                            </div>
                                        )}
                                    </div>
                                    <div style={{
                                        fontSize: '15px',
                                        color: '#666',
                                        marginBottom: '5px'
                                    }}>
                                        <span style={{ marginRight: '5px' }}>📧</span> {selectedApplicant.email}
                                    </div>
                                    {selectedApplicant.phone && (
                                        <div style={{
                                            fontSize: '15px',
                                            color: '#666'
                                        }}>
                                            <span style={{ marginRight: '5px' }}>📱</span> {selectedApplicant.phone}
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            
                            <div style={{ 
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                                gap: '20px',
                                marginBottom: '25px'
                            }}>
                                {/* Resume section
                                {selectedApplicant.resumeURL && (
                                    <div style={{ 
                                        backgroundColor: '#f9f9f9',
                                        borderRadius: '8px',
                                        padding: '15px',
                                        border: '1px solid #eee'
                                    }}>
                                        <h5 style={{
                                            margin: '0 0 10px 0',
                                            fontSize: '16px',
                                            fontWeight: '600',
                                            color: '#333',
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}>
                                            <span style={{ marginRight: '8px' }}>📄</span> Resume
                                        </h5>
                                        <a
                                            href={selectedApplicant.resumeURL}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ 
                                                display: 'flex',
                                                alignItems: 'center',
                                                padding: '10px',
                                                backgroundColor: '#fff',
                                                borderRadius: '5px',
                                                border: '1px solid #ddd',
                                                color: '#3498db',
                                                textDecoration: 'none',
                                                fontWeight: '500',
                                                transition: 'background-color 0.2s'
                                            }}
                                        >
                                            <span style={{ marginRight: '8px' }}>⬇️</span>
                                            Download Resume
                                        </a>
                                    </div>
                                )} */}
                                
                                {/* GitHub section */}
                                {selectedApplicant.githubRepo && (
                                    <div style={{ 
                                        backgroundColor: '#f9f9f9',
                                        borderRadius: '8px',
                                        padding: '15px',
                                        border: '1px solid #eee'
                                    }}>
                                        <h5 style={{
                                            margin: '0 0 10px 0',
                                            fontSize: '16px',
                                            fontWeight: '600',
                                            color: '#333',
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}>
                                            <span style={{ marginRight: '8px' }}>👨‍💻</span> GitHub Repository
                                        </h5>
                                        <a
                                            href={selectedApplicant.githubRepo}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ 
                                                display: 'flex',
                                                alignItems: 'center',
                                                padding: '10px',
                                                backgroundColor: '#fff',
                                                borderRadius: '5px',
                                                border: '1px solid #ddd',
                                                color: '#3498db',
                                                textDecoration: 'none',
                                                fontWeight: '500',
                                                transition: 'background-color 0.2s',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            <span style={{ marginRight: '8px' }}>🔗</span>
                                            {selectedApplicant.githubRepo.replace(/^https?:\/\/(www\.)?github\.com\//, '')}
                                        </a>
                                    </div>
                                )}
                            </div>
                            
                            
                            {/* Social links section */}
                            {selectedApplicant.socialLinks && Object.keys(selectedApplicant.socialLinks).length > 0 && (
                                <div style={{ 
                                    marginBottom: '25px',
                                    backgroundColor: '#f9f9f9',
                                    borderRadius: '8px',
                                    padding: '15px',
                                    border: '1px solid #eee'
                                }}>
                                    <h5 style={{
                                        margin: '0 0 15px 0',
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        color: '#333',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}>
                                        <span style={{ marginRight: '8px' }}>🔗</span> Social Links
                                    </h5>
                                    <div style={{ 
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                                        gap: '10px'
                                    }}>
                                        {selectedApplicant.socialLinks.linkedin && (
                                            <a
                                                href={selectedApplicant.socialLinks.linkedin}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{ 
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    padding: '10px',
                                                    backgroundColor: '#e8f1f8',
                                                    borderRadius: '5px',
                                                    color: '#0077b5',
                                                    textDecoration: 'none',
                                                    fontWeight: '500',
                                                    transition: 'transform 0.2s',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                <span style={{ marginRight: '8px', fontSize: '18px' }}>in</span>
                                                LinkedIn
                                            </a>
                                        )}
                                        {selectedApplicant.socialLinks.portfolio && (
                                            <a
                                                href={selectedApplicant.socialLinks.portfolio}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{ 
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    padding: '10px',
                                                    backgroundColor: '#e8f5e9',
                                                    borderRadius: '5px',
                                                    color: '#388e3c',
                                                    textDecoration: 'none',
                                                    fontWeight: '500',
                                                    transition: 'transform 0.2s',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                <span style={{ marginRight: '8px', fontSize: '18px' }}>🌐</span>
                                                Portfolio
                                            </a>
                                        )}
                                        {selectedApplicant.socialLinks.twitter && (
                                            <a
                                                href={selectedApplicant.socialLinks.twitter}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{ 
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    padding: '10px',
                                                    backgroundColor: '#e8f5fd',
                                                    borderRadius: '5px',
                                                    color: '#1da1f2',
                                                    textDecoration: 'none',
                                                    fontWeight: '500',
                                                    transition: 'transform 0.2s',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                <span style={{ marginRight: '8px', fontSize: '18px' }}>🐦</span>
                                                Twitter
                                            </a>
                                        )}
                                        {selectedApplicant.socialLinks.other && (
                                            <a
                                                href={selectedApplicant.socialLinks.other}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{ 
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    padding: '10px',
                                                    backgroundColor: '#fff3e0',
                                                    borderRadius: '5px',
                                                    color: '#ff9800',
                                                    textDecoration: 'none',
                                                    fontWeight: '500',
                                                    transition: 'transform 0.2s',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                <span style={{ marginRight: '8px', fontSize: '18px' }}>🔗</span>
                                                Other
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}
                            

                            {/* Certifications section */}
                            <div style={{ 
                                marginBottom: '25px',
                                backgroundColor: '#f9f9f9',
                                borderRadius: '8px',
                                padding: '15px',
                                border: '1px solid #eee'
                            }}>
                                <h5 style={{
                                    margin: '0 0 15px 0',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    color: '#333',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}>
                                    <span style={{ marginRight: '8px' }}>🏆</span> Certifications
                                </h5>
                                {selectedApplicant.certifications && Object.keys(selectedApplicant.certifications).length > 0 ? (
                                    <div style={{ 
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                                        gap: '15px'
                                    }}>
                                        {Object.entries(selectedApplicant.certifications).map(([skill, certs]) => (
                                            <div key={skill} style={{ 
                                                backgroundColor: '#fff',
                                                borderRadius: '6px',
                                                padding: '15px',
                                                boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
                                            }}>
                                                <div style={{
                                                    fontWeight: '600',
                                                    fontSize: '15px',
                                                    color: '#333',
                                                    marginBottom: '10px',
                                                    borderBottom: '1px solid #eee',
                                                    paddingBottom: '5px'
                                                }}>{skill}</div>
                                                <div style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '5px'
                                                }}>
                                                   
                                                      {certs.map((cert, index) => (
                                                        <button
                                                        key={`${skill}-${index}`}
                                                        onClick={() => {
                                                          setSelectedApplicant({ ...selectedApplicant, selectedCert: cert });
                                                          setShowModal(true);
                                                        }}
                                                        style={{
                                                          fontSize: '14px',
                                                          color: '#3498db',
                                                          background: 'none',
                                                          border: 'none',
                                                          cursor: 'pointer',
                                                          display: 'flex',
                                                          alignItems: 'center',
                                                          padding: '3px 0',
                                                          outline: 'none'
                                                        }}
                                                      >
                                                        <span style={{ marginRight: '5px', fontSize: '12px' }}>🔗</span>
                                                        Certificate {index + 1}
                                                      </button>
                                                      
                                                      ))}
                                                      
                                             
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{
                                    padding: '15px',
                                    textAlign: 'center',
                                    color: '#777',
                                    backgroundColor: '#f2f2f2',
                                    borderRadius: '6px',
                                    border: '1px dashed #ddd'
                                }}>
                                    No certifications provided
                                </div>
                            )}
                        </div>
                        
                        {/* Application details section */}
                        <div style={{ 
                            marginBottom: '25px',
                            backgroundColor: '#f9f9f9',
                            borderRadius: '8px',
                            padding: '15px',
                            border: '1px solid #eee'
                        }}>
                            <h5 style={{
                                margin: '0 0 15px 0',
                                fontSize: '16px',
                                fontWeight: '600',
                                color: '#333',
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                <span style={{ marginRight: '8px' }}>📝</span> Application Details
                            </h5>
                            
                            <div style={{ marginBottom: '15px' }}>
                                <div style={{ fontWeight: '600', marginBottom: '5px', color: '#555' }}>Cover Letter</div>
                                <div style={{ 
                                    backgroundColor: '#fff',
                                    borderRadius: '6px',
                                    padding: '15px',
                                    border: '1px solid #eee',
                                    lineHeight: '1.6',
                                    color: '#444',
                                    fontSize: '14px'
                                }}>
                                    {selectedApplicant.socialLinks|| "No cover letter provided"}
                                </div>
                            </div>
                            
                            {selectedApplicant.portfolioLinks && selectedApplicant.portfolioLinks.length > 0 && (
                                <div style={{ marginBottom: '15px' }}>
                                    <div style={{ fontWeight: '600', marginBottom: '5px', color: '#555' }}>Portfolio Links</div>
                                    <div style={{ 
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '5px'
                                    }}>
                                        {selectedApplicant.portfolioLinks.map((link, index) => (
                                            <a 
                                                key={index}
                                                href={link} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                style={{
                                                    fontSize: '14px',
                                                    color: '#3498db',
                                                    textDecoration: 'none',
                                                    backgroundColor: '#f0f8ff',
                                                    padding: '8px 12px',
                                                    borderRadius: '4px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                <span style={{ marginRight: '8px', fontSize: '14px' }}>🔗</span>
                                                {link}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {selectedApplicant.additionalInfo && (
                                <div>
                                    <div style={{ fontWeight: '600', marginBottom: '5px', color: '#555' }}>Additional Information</div>
                                    <div style={{ 
                                        backgroundColor: '#fff',
                                        borderRadius: '6px',
                                        padding: '15px',
                                        border: '1px solid #eee',
                                        lineHeight: '1.6',
                                        color: '#444',
                                        fontSize: '14px'
                                    }}>
                                        {selectedApplicant.additionalInfo}
                                    </div>
                                </div>
                            )}
                        </div>

                        

                        {/* Contact applicant section */}
                        <div style={{ 
                            marginBottom: '25px',
                            backgroundColor: '#f0f8ff',
                            borderRadius: '8px',
                            padding: '15px',
                            border: '1px solid #d1e6fa'
                        }}>
                            <h5 style={{
                                margin: '0 0 15px 0',
                                fontSize: '16px',
                                fontWeight: '600',
                                color: '#1976d2',
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                <span style={{ marginRight: '8px' }}>✉️</span> Contact Applicant
                            </h5>
                            
                            <div style={{ marginBottom: '15px' }}>
                                <div style={{ fontWeight: '600', marginBottom: '5px', color: '#555' }}>Email Subject</div>
                                <input 
                                    type="text" 
                                    value={emailSubject} 
                                    onChange={(e) => setEmailSubject(e.target.value)} 
                                    placeholder="Regarding your application for [Job Title]"
                                    style={{ 
                                        width: '100%', 
                                        padding: '10px', 
                                        borderRadius: '5px',
                                        border: '1px solid #cce5ff',
                                        backgroundColor: '#fff'
                                    }} 
                                />
                            </div>
                            
                            <div style={{ marginBottom: '15px' }}>
                                <div style={{ fontWeight: '600', marginBottom: '5px', color: '#555' }}>Email Body</div>
                                <textarea 
                                    value={emailBody} 
                                    onChange={(e) => setEmailBody(e.target.value)} 
                                    placeholder="Write your message to the applicant here..."
                                    style={{ 
                                        width: '100%', 
                                        padding: '10px', 
                                        borderRadius: '5px',
                                        border: '1px solid #cce5ff',
                                        backgroundColor: '#fff',
                                        minHeight: '120px',
                                        resize: 'vertical'
                                    }} 
                                />
                            </div>
                            
                            <button 
                                onClick={handleEmailSend}
                                disabled={!emailSubject || !emailBody}
                                style={{
                                    backgroundColor: !emailSubject || !emailBody ? '#b3d7ff' : '#1976d2',
                                    color: !emailSubject || !emailBody ? '#666' : '#fff',
                                    border: 'none',
                                    padding: '10px 15px',
                                    borderRadius: '5px',
                                    cursor: !emailSubject || !emailBody ? 'not-allowed' : 'pointer',
                                    fontWeight: '600',
                                    width: '100%',
                                    fontSize: '16px'
                                }}
                            >
                                Send Email
                            </button>
                        </div>
                        
                        {/* Action buttons */}
                        <div style={{ 
                            display: 'flex',
                            gap: '15px',
                            marginTop: '15px' 
                        }}>
                            <button 
                                className="hire-btn" 
                                onClick={handleHireApplicant}
                                style={{
                                    backgroundColor: '#2ecc71',
                                    color: '#fff',
                                    border: 'none',
                                    padding: '12px',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    flex: '1',
                                    fontSize: '16px',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}
                            >
                                <span style={{ marginRight: '8px' }}>✅</span> Hire Applicant
                            </button>
                            <button 
                                className="reject-btn" 
                                onClick={handleRejectApplicant}
                                style={{
                                    backgroundColor: '#e74c3c',
                                    color: '#fff',
                                    border: 'none',
                                    padding: '12px',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    flex: '1',
                                    fontSize: '16px',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}
                            >
                                <span style={{ marginRight: '8px' }}>❌</span> Reject Applicant
                            </button>
                        </div>
                    </div>{showModal && selectedApplicant?.selectedCert && (
  <ApplicantDetailsModal
    cert={selectedApplicant.selectedCert}
    onClose={() => {
      setShowModal(false);
      setSelectedApplicant(null);
    }}
  />
)}
                
                </div>
                
                
            </div>
        )}
    </div>
);
};

export default EmployerProfile;