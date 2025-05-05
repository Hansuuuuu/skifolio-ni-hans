// import React, { useState, useEffect } from 'react';
// import { db, auth } from '../firebase';
// import { doc, setDoc, getDoc } from 'firebase/firestore';
// import { useAuthState } from 'react-firebase-hooks/auth';

// const EmployerJobPost = () => {
//     const [user] = useAuthState(auth);
//     const [title, setTitle] = useState('');
//     const [description, setDescription] = useState('');
//     const [location, setLocation] = useState('');
//     const [averageScore, setAverageScore] = useState(50); // Default average score to 50
//     const [companyName, setCompanyName] = useState('');

//     // Fetch the company name when the component mounts
//     useEffect(() => {
//         const fetchCompanyName = async () => {
//             try {
//                 if (user) {
//                     const employerDoc = await getDoc(doc(db, 'employers', user.uid));
//                     if (employerDoc.exists()) {
//                         setCompanyName(employerDoc.data().companyName);
//                     }
//                 }
//             } catch (error) {
//                 console.error('Error fetching company name:', error);
//             }
//         };
//         fetchCompanyName();
//     }, [user]);

//     const handleAverageScoreChange = (e) => {
//         const value = parseInt(e.target.value, 10) || 0;
//         setAverageScore(Math.max(0, Math.min(100, value))); // Clamp between 0 and 100
//     };

//     {/* START OF CHANGES IN EMPLOYER JOB POSTS*/}

//     const styles = {
//         formContainer: {
//             display: 'flex',
//             flexDirection: 'column',
//             gap: '10px',
//             maxWidth: '500px',
//             margin: 'auto',
//             padding: '20px',
//             border: '1px solid #ddd',
//             borderRadius: '8px',
//             backgroundColor: '#f9f9f9',
//             boxShadow: 'none' // Ensures no shadow
//         },
//         input: {
//             width: '100%',
//             padding: '10px',
//             border: '1px solid #ccc',
//             borderRadius: '5px',
//             boxShadow: 'none' // Removes any shadow on focus
//         },
//         textarea: {
//             width: '100%',
//             padding: '10px',
//             border: '1px solid #ccc',
//             borderRadius: '5px',
//             minHeight: '80px',
//             boxShadow: 'none'
//         },
//         button: {
//             padding: '10px 20px',
//             backgroundColor: '#007bff',
//             color: '#fff',
//             border: 'none',
//             borderRadius: '5px',
//             cursor: 'pointer',
//             transition: 'background 0.3s',
//             boxShadow: 'none' // Removes default button shadow
//         }
//     };

//     {/* END OF CHANGES IN EMPLOYER JOB POSTS*/}

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         try {
//             const jobId = `job_${Date.now()}`;
//             const jobRef = doc(db, 'jobs-to-be-approved', jobId);

//             await setDoc(jobRef, {
//                 id: jobId,
//                 title,
//                 description,
//                 location,
//                 averageScore,
//                 createdAt: new Date(),
//                 employerId: user?.uid,
//                 companyName,
//                 status: 'pending',
//             });

//             // Clear form after submission
//             setTitle('');
//             setDescription('');
//             setLocation('');
//             setAverageScore(50);
//             alert('Job posted successfully and is awaiting approval!');
//         } catch (error) {
//             console.error('Error posting job:', error);
//             alert('Failed to post the job. Please try again.');
//         }
//     };

//     return (
//         <div id="job-posting-container" style={{ padding: '20px', maxWidth: '600px', margin: 'auto',marginTop:"90px", borderRadius: "8px" }}>
//             <h2>Post a Job</h2>
//             <form onSubmit={handleSubmit} style={styles.formContainer}>
//                 <input
//                     type="text"
//                     placeholder="Job Title"
//                     value={title}
//                     onChange={(e) => setTitle(e.target.value)}
//                     required
//                     style={styles.input}
//                 />
//                 <textarea
//                     placeholder="Job Description"
//                     value={description}
//                     onChange={(e) => setDescription(e.target.value)}
//                     required
//                     style={styles.textarea}
//                 />
//                 <input
//                     type="text"
//                     placeholder="Location"
//                     value={location}
//                     onChange={(e) => setLocation(e.target.value)}
//                     required
//                     style={styles.input}
//                 />

//                 {/* Average Score Input */}
//                 <div style={styles.scoreContainer}>
//                     <label style={styles.label}>Average Score:</label>
//                     <div style={styles.rangeContainer}>
//                         <input
//                             type="number"
//                             value={averageScore}
//                             min="0"
//                             max="100"
//                             onChange={handleAverageScoreChange}
//                             placeholder="0-100"
//                             style={styles.numberInput}
//                         />
//                         <input
//                             type="range"
//                             min="0"
//                             max="100"
//                             value={averageScore}
//                             onChange={(e) => setAverageScore(parseInt(e.target.value, 10))}
//                             style={styles.rangeInput}
//                         />
//                         <span style={styles.percentage}>{averageScore}%</span>
//                     </div>
//                 </div>

//                 <button type="submit" style={styles.button}>
//                     Submit Job
//                 </button>
//             </form>

//             {/* START of changed Explanation Section START OF EXCLAMATION HOVER*/}
//             <div style={{ marginTop: '20px', padding: '10px', background: '#f9f9f9', border: '1px solid #ddd', borderRadius: '5px', position: 'relative' }}>
//             <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', position: 'relative' }}>
//                 <span className="tooltip-exclamation">!</span>
//                 <div className="tooltip-text">
//                     <strong>How the System Evaluates the Average Score:</strong><br />
//                     <strong>HTML:</strong> Evaluates structure, accessibility, and avoidance of deprecated tags like <code>&lt;font&gt;</code>.<br />
//                     <strong>CSS:</strong> Ensures modularity, minimal use of <code>!important</code>, and adherence to coding standards.<br />
//                     <strong>JavaScript:</strong> Checks for clean code, modularity, and avoidance of debugging artifacts like <code>console.log</code>.<br /><br />
//                     The average score reflects the quality standard for applicants' portfolios.
//                 </div>
//                 <strong style={{ marginLeft: '10px' }}>How the System Evaluates the Average Score:</strong>
//             </div>
//         </div>
//             {/* END of changed Explanation Section START OF EXCLAMATION HOVER*/}
//         </div>
//     );
// };

// export default EmployerJobPost;
import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';

// Import job options from a shared location
const jobOptions = [
  "Front-end Developer", "Back-end Developer", "Full Stack Developer",
  "React Developer", "Vue.js Developer", "Angular Developer",
  "Node.js Developer", "Django Developer", "Laravel Developer",
  "Express.js Developer", "JavaScript Engineer", "TypeScript Developer",
  "Next.js Developer", "Nuxt.js Developer", "API Developer"
];

const EmployerJobPost = () => {
    const [user] = useAuthState(auth);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [averageScore, setAverageScore] = useState(50); // Default average score to 50
    const [companyName, setCompanyName] = useState('');
    const [jobRole, setJobRole] = useState(''); // New state for job role dropdown

    // Fetch the company name when the component mounts
    useEffect(() => {
        const fetchCompanyName = async () => {
            try {
                if (user) {
                    const employerDoc = await getDoc(doc(db, 'employers', user.uid));
                    if (employerDoc.exists()) {
                        setCompanyName(employerDoc.data().companyName);
                    }
                }
            } catch (error) {
                console.error('Error fetching company name:', error);
            }
        };
        fetchCompanyName();
    }, [user]);

    const handleAverageScoreChange = (e) => {
        const value = parseInt(e.target.value, 10) || 0;
        setAverageScore(Math.max(0, Math.min(100, value))); // Clamp between 0 and 100
    };

    const styles = {
        formContainer: {
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            maxWidth: '500px',
            margin: 'auto',
            padding: '20px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            backgroundColor: '#f9f9f9',
            boxShadow: 'none' // Ensures no shadow
        },
        input: {
            width: '100%',
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '5px',
            boxShadow: 'none' // Removes any shadow on focus
        },
        textarea: {
            width: '100%',
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '5px',
            minHeight: '80px',
            boxShadow: 'none'
        },
        select: {
            width: '100%',
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '5px',
            boxShadow: 'none',
            backgroundColor: '#fff'
        },
        button: {
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            transition: 'background 0.3s',
            boxShadow: 'none' // Removes default button shadow
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const jobId = `job_${Date.now()}`;
            const jobRef = doc(db, 'jobs-to-be-approved', jobId);

            await setDoc(jobRef, {
                id: jobId,
                title,
                description,
                location,
                jobRole, // Add the job role to the document
                averageScore,
                createdAt: new Date(),
                employerId: user?.uid,
                companyName,
                jobRole,
                status: 'pending',
            });

            // Clear form after submission
            setTitle('');
            setDescription('');
            setLocation('');
            setJobRole('');
            setAverageScore(50);
            alert('Job posted successfully and is awaiting approval!');
        } catch (error) {
            console.error('Error posting job:', error);
            alert('Failed to post the job. Please try again.');
        }
    };

    return (
        <div id="job-posting-container" style={{ padding: '20px', maxWidth: '600px', margin: 'auto',marginTop:"90px", borderRadius: "8px" }}>
            <h2>Post a Job</h2>
            <form onSubmit={handleSubmit} style={styles.formContainer}>
                <input
                    type="text"
                    placeholder="Job Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    style={styles.input}
                />
                
                {/* Job Role Dropdown */}
                <select
                    value={jobRole}
                    onChange={(e) => setJobRole(e.target.value)}
                    required
                    style={styles.select}
                >
                    <option value="">Select Job Role</option>
                    {jobOptions.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
                
                <textarea
                    placeholder="Job Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    style={styles.textarea}
                />
                <input
                    type="text"
                    placeholder="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                    style={styles.input}
                />

                {/* Average Score Input */}
                <div style={styles.scoreContainer}>
                    <label style={styles.label}>Average Score:</label>
                    <div style={styles.rangeContainer}>
                        <input
                            type="number"
                            value={averageScore}
                            min="0"
                            max="100"
                            onChange={handleAverageScoreChange}
                            placeholder="0-100"
                            style={styles.numberInput}
                        />
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={averageScore}
                            onChange={(e) => setAverageScore(parseInt(e.target.value, 10))}
                            style={styles.rangeInput}
                        />
                        <span style={styles.percentage}>{averageScore}%</span>
                    </div>
                </div>

                <button type="submit" style={styles.button}>
                    Submit Job
                </button>
            </form>

            <div style={{ marginTop: '20px', padding: '10px', background: '#f9f9f9', border: '1px solid #ddd', borderRadius: '5px', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', position: 'relative' }}>
                <span className="tooltip-exclamation">!</span>
                <div className="tooltip-text">
                    <strong>How the System Evaluates the Average Score:</strong><br />
                    <strong>HTML:</strong> Evaluates structure, accessibility, and avoidance of deprecated tags like <code>&lt;font&gt;</code>.<br />
                    <strong>CSS:</strong> Ensures modularity, minimal use of <code>!important</code>, and adherence to coding standards.<br />
                    <strong>JavaScript:</strong> Checks for clean code, modularity, and avoidance of debugging artifacts like <code>console.log</code>.<br /><br />
                    The average score reflects the quality standard for applicants' portfolios.
                </div>
                <strong style={{ marginLeft: '10px' }}>How the System Evaluates the Average Score:</strong>
            </div>
        </div>
        </div>
    );
};

export default EmployerJobPost;