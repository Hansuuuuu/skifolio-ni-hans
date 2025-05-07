
// import React, { useState } from 'react';
// import { auth, db, storage } from '../firebase';
// import { useNavigate,Link } from 'react-router-dom';
// import { 
//     createUserWithEmailAndPassword, 
//     signInWithEmailAndPassword, 
//     signOut, 
//     sendEmailVerification, 
//     sendPasswordResetEmail
// } from 'firebase/auth';
// import { doc, setDoc, getDoc } from 'firebase/firestore';
// import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// const Auth = ({ userType, setUser }) => {
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const [showPassword, setShowPassword] = useState(false);
//     const [name, setName] = useState('');
//     const [githubLink, setGithubLink] = useState('');
//     const [companyName, setCompanyName] = useState('');
//     const [businessPermit, setBusinessPermit] = useState(null);
//     const [isSignUp, setIsSignUp] = useState(true);
//     const [agreedToTerms, setAgreedToTerms] = useState(false);
//     const [resetEmail, setResetEmail] = useState('');
//     const navigate = useNavigate();

//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         if (isSignUp && !agreedToTerms) {
//             alert('Please accept the terms and conditions.');
//             return;
//         }

//         try {
//             let userCredential;

//             if (isSignUp) {
//                 userCredential = await createUserWithEmailAndPassword(auth, email, password);
//                 await sendEmailVerification(userCredential.user);
//                 alert('A verification email has been sent. Please verify before signing in.');

//                 let businessPermitURL = null;
//                 if (userType === 'employer' && businessPermit) {
//                     const storageRef = ref(storage, `businessPermits/${userCredential.user.uid}`);
//                     await uploadBytes(storageRef, businessPermit);
//                     businessPermitURL = await getDownloadURL(storageRef);
//                 }

//                 const userData = {
//                     email,
//                     type: userType,
//                     status: 'pending',
//                     name: userType === 'applicant' ? name : null,
//                     githubLink: userType === 'applicant' ? githubLink : null,
//                     companyName: userType === 'employer' ? companyName : null,
//                     businessPermit: userType === 'employer' ? businessPermitURL : null
//                 };

//                 await setDoc(doc(db, 'userAccountsToApprove', userCredential.user.uid), userData);
//                 await setDoc(doc(db, 'userAccountsToBeApproved', userCredential.user.uid), userData);

//                 await signOut(auth);
//                 navigate('/');
//                 return;
//             } else {
//                 userCredential = await signInWithEmailAndPassword(auth, email, password);
//                 const user = userCredential.user;

//                 if (!user.emailVerified) {
//                     alert('Please verify your email before signing in.');
//                     await signOut(auth);
//                     navigate('/');
//                     return;
//                 }

//                 const uid = user.uid;
//                 const userDocToApprove = await getDoc(doc(db, 'userAccountsToApprove', uid));
//                 const userDocToBeApproved = await getDoc(doc(db, 'userAccountsToBeApproved', uid));

//                 if (!userDocToApprove.exists()) {
//                     alert('Your account is not found. Please sign up.');
//                     await signOut(auth);
//                     navigate('/');
//                     return;
//                 }

//                 const userData = userDocToApprove.data();

//                 if (userDocToBeApproved.exists()) {
//                     alert('Your account is pending approval. Please wait for admin approval.');
//                     await signOut(auth);
//                     navigate('/');
//                     return;
//                 }

//                 if (userData.status !== 'approved') {
//                     alert('Your account is not yet approved. Please wait for admin approval.');
//                     await signOut(auth);
//                     navigate('/');
//                     return;
//                 }

//                 setUser(user);
//                 navigate(userData.type === 'employer' ? '/employer/profile' : '/applicant/profile');
//             }
//         } catch (error) {
//             console.error('Error signing in/up:', error);
//             alert('An error occurred. Please try again.');
//         }
//     };

//     const handleForgotPassword = async () => {
//         if (!resetEmail) {
//             alert('Please enter your email to reset the password.');
//             return;
//         }
//         try {
//             await sendPasswordResetEmail(auth, resetEmail);
//             alert('Password reset email sent. Please check your inbox.');
//         } catch (error) {
//             console.error('Error sending password reset email:', error);
//             alert('Error sending password reset email. Please try again.');
//         }
//     };

//     return (
//         <div className="hero" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
//             <div className="choicecontainer2" style={{ textAlign: 'center', width: '100%', maxWidth: '400px' }}>
//                 <form onSubmit={handleSubmit} id="formauth" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
//                     <h2 style={{ fontFamily: "times new roman" }}>{isSignUp ? 'Sign Up' : 'Sign In'} as {userType}</h2>

//                     <input className="inputs" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ marginBottom: '10px', width: '100%' }} />
                    
//                     <div style={{ position: 'relative', width: '100%', marginBottom: '10px',  display: "flex", flexDirection: "column", alignItems: "center" }}>
//                         <input className="inputs" type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%' }} />
//                         <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'black' }}>
//                             {showPassword ? 'Hide' : 'Show'}
//                         </button>
//                     </div>

//                     {isSignUp && userType === 'applicant' && (
//                         <>
//                             <input className="inputs" type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required style={{ marginBottom: '10px', width: '100%' }} />
//                             <input className="inputs" type="text" placeholder="GitHub Link" value={githubLink} onChange={(e) => setGithubLink(e.target.value)} required style={{ marginBottom: '10px', width: '100%' }} />
//                         </>
//                     )}

//                     {isSignUp && userType === 'employer' && (
//                         <>
//                             <input className="inputs" type="text" placeholder="Company Name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required style={{ marginBottom: '10px', width: '100%' }} />
//                             <input className="inputs" type="file" accept=".pdf,.jpg,.png" onChange={(e) => setBusinessPermit(e.target.files[0])} required style={{ marginBottom: '10px', width: '100%' }} />
//                         </>
//                     )}

//                     {isSignUp && (
//                         <div style={{ marginBottom: '20px' }}>
//                             <input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} style={{ marginRight: '5px' }} />
//                             <label>
//                                 I agree to the <a href="/terms" target="_blank" rel="noopener noreferrer">Terms and Conditions</a>
//                             </label>
//                         </div>
//                     )}
                    
//                     <button type="submit" className="input submit">{isSignUp ? 'Sign Up' : 'Sign In'}</button>
//                     <Link to="/select">
//                                                     <button className="submit">Cancel</button>
//                     </Link>
//                     {!isSignUp && (
//                         <button type="button" onClick={handleForgotPassword} style={{ background: 'none', border: 'none', color: 'blue', cursor: 'pointer', marginTop: '10px' ,}}>
//                             Forgot Password?
//                         </button>
//                     )}
//                 </form>
//             </div>
//         </div>
//     );
// };

// export default Auth;

// import React, { useState } from 'react';
// import { auth, db } from '../firebase';
// import { useNavigate, Link } from 'react-router-dom';
// import { 
//     createUserWithEmailAndPassword, 
//     signInWithEmailAndPassword, 
//     signOut, 
//     sendEmailVerification, 
//     sendPasswordResetEmail
// } from 'firebase/auth';
// import { doc, setDoc, getDoc } from 'firebase/firestore';

// const Auth = ({ userType, setUser }) => {
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const [showPassword, setShowPassword] = useState(false);
//     const [name, setName] = useState('');
//     const [githubRepo, setGithubRepo] = useState('');
//     const [companyName, setCompanyName] = useState('');
//     const [companyWebsite, setCompanyWebsite] = useState('');
//     const [isSignUp, setIsSignUp] = useState(true);
//     const [agreedToTerms, setAgreedToTerms] = useState(false);
//     const [resetEmail, setResetEmail] = useState('');
//     const [verifying, setVerifying] = useState(false);
//     const navigate = useNavigate();

//     const verifyGithubOwnership = async (repoUrl, userEmail) => {
//         try {
//             setVerifying(true);
            
//             // Clean up the GitHub repo URL
//             let cleanRepoUrl = repoUrl.trim();
//             if (cleanRepoUrl.endsWith('/')) {
//                 cleanRepoUrl = cleanRepoUrl.slice(0, -1);
//             }
            
//             // Construct the API URL to fetch the latest commit
//             const apiUrl = cleanRepoUrl.replace('github.com', 'api.github.com/repos') + '/commits';
            
//             // Fetch the latest commit
//             const response = await fetch(apiUrl);
//             if (!response.ok) {
//                 throw new Error('Failed to fetch repository data. Please check if the repository exists and is public.');
//             }
            
//             const commits = await response.json();
//             if (!commits || commits.length === 0) {
//                 throw new Error('No commits found in this repository.');
//             }
            
//             // Get the latest commit
//             const latestCommit = commits[0];
            
//             // Get the author email directly from the commit data
//             const authorEmail = latestCommit.commit.author.email.toLowerCase();
//             const providedEmail = userEmail.toLowerCase();
            
//             if (authorEmail !== providedEmail) {
//                 throw new Error('The email used for the latest commit does not match your login email.');
//             }
            
//             setVerifying(false);
//             return true;
//         } catch (error) {
//             setVerifying(false);
//             alert(`GitHub verification failed: ${error.message}`);
//             clearInputs();
//             return false;
//         }
//     };

//     const clearInputs = () => {
//         setName('');
//         setGithubRepo('');
//         setCompanyName('');
//         setCompanyWebsite('');
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         if (isSignUp && !agreedToTerms) {
//             alert('Please accept the terms and conditions.');
//             return;
//         }

//         try {
//             let userCredential;

//             if (isSignUp) {
//                 // For applicants, verify GitHub ownership before proceeding
//                 if (userType === 'applicant') {
//                     const isGithubVerified = await verifyGithubOwnership(githubRepo, email);
//                     if (!isGithubVerified) {
//                         return;
//                     }
//                 }

//                 userCredential = await createUserWithEmailAndPassword(auth, email, password);
//                 await sendEmailVerification(userCredential.user);
//                 alert('A verification email has been sent. Please verify before signing in.');

//                 const userData = {
//                     email,
//                     type: userType,
//                     status: 'pending',
//                     name: userType === 'applicant' ? name : null,
//                     githubRepo: userType === 'applicant' ? githubRepo : null,
//                     companyName: userType === 'employer' ? companyName : null,
//                     companyWebsite: userType === 'employer' ? companyWebsite : null
//                 };

//                 await setDoc(doc(db, 'userAccountsToApprove', userCredential.user.uid), userData);
//                 await setDoc(doc(db, 'userAccountsToBeApproved', userCredential.user.uid), userData);

//                 await signOut(auth);
//                 navigate('/');
//                 return;
//             } else {
//                 userCredential = await signInWithEmailAndPassword(auth, email, password);
//                 const user = userCredential.user;

//                 if (!user.emailVerified) {
//                     alert('Please verify your email before signing in.');
//                     await signOut(auth);
//                     navigate('/');
//                     return;
//                 }

//                 const uid = user.uid;
//                 const userDocToApprove = await getDoc(doc(db, 'userAccountsToApprove', uid));
//                 const userDocToBeApproved = await getDoc(doc(db, 'userAccountsToBeApproved', uid));

//                 if (!userDocToApprove.exists()) {
//                     alert('Your account is not found. Please sign up.');
//                     await signOut(auth);
//                     navigate('/');
//                     return;
//                 }

//                 const userData = userDocToApprove.data();

//                 if (userDocToBeApproved.exists()) {
//                     alert('Your account is pending approval. Please wait for admin approval.');
//                     await signOut(auth);
//                     navigate('/');
//                     return;
//                 }

//                 if (userData.status !== 'approved') {
//                     alert('Your account is not yet approved. Please wait for admin approval.');
//                     await signOut(auth);
//                     navigate('/');
//                     return;
//                 }

//                 setUser(user);
//                 navigate(userData.type === 'employer' ? '/employer/profile' : '/applicant/profile');
//             }
//         } catch (error) {
//             console.error('Error signing in/up:', error);
//             alert('An error occurred. Please try again.');
//         }
//     };

//     const handleForgotPassword = async () => {
//         if (!resetEmail) {
//             alert('Please enter your email to reset the password.');
//             return;
//         }
//         try {
//             await sendPasswordResetEmail(auth, resetEmail);
//             alert('Password reset email sent. Please check your inbox.');
//         } catch (error) {
//             console.error('Error sending password reset email:', error);
//             alert('Error sending password reset email. Please try again.');
//         }
//     };

//     return (
//         <div className="hero" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
//             <div className="choicecontainer2" style={{ textAlign: 'center', width: '100%', maxWidth: '400px' }}>
//                 <form onSubmit={handleSubmit} id="formauth" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
//                     <h2 style={{ fontFamily: "times new roman" }}>{isSignUp ? 'Sign Up' : 'Sign In'} as {userType}</h2>

//                     <input className="inputs" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ marginBottom: '10px', width: '100%' }} />
                    
//                     <div style={{ position: 'relative', width: '100%', marginBottom: '10px',  display: "flex", flexDirection: "column", alignItems: "center" }}>
//                         <input className="inputs" type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%' }} />
//                         <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'black' }}>
//                             {showPassword ? 'Hide' : 'Show'}
//                         </button>
//                     </div>

//                     {isSignUp && userType === 'applicant' && (
//                         <>
//                             <input className="inputs" type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required style={{ marginBottom: '10px', width: '100%' }} />
//                             <input className="inputs" type="text" placeholder="GitHub Repository URL" value={githubRepo} onChange={(e) => setGithubRepo(e.target.value)} required style={{ marginBottom: '10px', width: '100%' }} />
//                         </>
//                     )}

//                     {isSignUp && userType === 'employer' && (
//                         <>
//                             <input className="inputs" type="text" placeholder="Company Name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required style={{ marginBottom: '10px', width: '100%' }} />
//                             <input className="inputs" type="url" placeholder="Company Website" value={companyWebsite} onChange={(e) => setCompanyWebsite(e.target.value)} required style={{ marginBottom: '10px', width: '100%' }} />
//                         </>
//                     )}

//                     {isSignUp && (
//                         <div style={{ marginBottom: '20px' }}>
//                             <input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} style={{ marginRight: '5px' }} />
//                             <label>
//                                 I agree to the <a href="/terms" target="_blank" rel="noopener noreferrer">Terms and Conditions</a>
//                             </label>
//                         </div>
//                     )}
                    
//                     <button type="submit" className="input submit" disabled={verifying}>
//                         {verifying ? 'Verifying...' : (isSignUp ? 'Sign Up' : 'Sign In')}
//                     </button>
//                     <Link to="/select">
//                         <button className="submit">Cancel</button>
//                     </Link>
//                     {!isSignUp && (
//                         <button type="button" onClick={handleForgotPassword} style={{ background: 'none', border: 'none', color: 'blue', cursor: 'pointer', marginTop: '10px' }}>
//                             Forgot Password?
//                         </button>
//                     )}
//                 </form>
//             </div>
//         </div>
//     );
// };

// export default Auth;

import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { useNavigate, Link } from 'react-router-dom';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    sendEmailVerification, 
    sendPasswordResetEmail
} from 'firebase/auth';
import { writeBatch, doc, setDoc, getDoc } from 'firebase/firestore';

// Updated Modal Component - Enhanced to match expandedJob style
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with click-to-close */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50" 
        onClick={onClose}
      ></div>
      
      {/* Modal content - Now using the expandedJob styling */}
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
          maxWidth: "800px",
          maxHeight: "80vh",
          padding: "24px",
          zIndex: 1000,
          overflowY: "auto",
          animation: "fadeIn 0.3s ease",
          fontFamily: "sans-serif",
        }}
      >
        {children}
      </div>
    </div>
  );
};

// Terms Component - Updated to match expandedJob style
const Terms = ({ onAgree, onClose }) => {
  const effectiveDate = new Date('2024-11-15').toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const sections = [
    {
      title: "1. Acceptance of Terms",
      content: "By accessing or using Skifolio, you agree to be bound by these Terms and Conditions. If you do not agree, please do not register, use, or access our services."
    },
    {
      title: "2. Account Eligibility",
      content: "You must be at least 13 years old to create an account. Employers must submit valid business documents to verify company identity."
    },
    {
      title: "3. Account Responsibilities",
      content: "Keep your login credentials secure and confidential. Immediately report unauthorized access or breaches. You are responsible for all activities that occur under your account.",
      list: true
    },
    {
      title: "4. User Conduct",
      content: "You agree not to:",
      listItems: [
        "Upload false or misleading information.",
        "Use Skifolio for unlawful or abusive purposes.",
        "Violate intellectual property rights of others."
      ]
    },
    {
      title: "5. Content Ownership",
      content: "All content you upload remains your intellectual property. By submitting content to Skifolio, you grant us a license to display and share it within the scope of the platform's purpose."
    },
    {
      title: "6. Employer Verification",
      content: "Employers must upload valid business permits and company details. These documents are reviewed and stored securely for verification purposes."
    },
    {
      title: "7. Account Approval",
      content: "All accounts are subject to verification and approval. Skifolio reserves the right to reject or suspend accounts that do not meet platform standards or violate these terms."
    },
    {
      title: "8. Termination",
      content: "We may suspend or terminate your account for violations of these Terms, misuse of the platform, or at our discretion with or without prior notice."
    },
    {
      title: "9. Limitation of Liability",
      content: "Skifolio is provided \"as is\" and we make no warranties regarding its accuracy, security, or availability. We are not liable for any indirect or consequential damages arising from the use of our platform."
    },
    {
      title: "10. Changes to Terms",
      content: "We may revise these Terms at any time. Continued use of Skifolio constitutes acceptance of the updated terms. We encourage users to review this page regularly."
    },
    {
      title: "11. Contact Us",
      content: "For questions or concerns regarding these Terms, please contact us at support@skifolio.com.",
      hasEmail: true
    }
  ];

  return (
    <>
      <h3 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "16px" }}>Terms and Conditions</h3>
      <p style={{ fontStyle: "italic", color: "#666", marginBottom: "16px" }}>
        Effective Date: {effectiveDate}
      </p>
      <hr style={{ margin: "16px 0", border: "0", borderTop: "1px solid #eee" }} />
      
      <div style={{ maxHeight: "50vh", overflowY: "auto", padding: "8px 4px", marginBottom: "20px" }}>
        {sections.map((section, index) => (
          <div key={index} style={{ marginBottom: "20px" }}>
            <h4 style={{ fontSize: "1.1rem", fontWeight: "600", color: "#333", marginBottom: "8px" }}>
              {section.title}
            </h4>
            
            {!section.listItems && !section.list && (
              <p style={{ fontSize: "0.95rem", lineHeight: "1.5", color: "#444" }}>
                {section.content}
                {section.hasEmail && (
                  <a 
                    href="mailto:support@skifolio.com" 
                    style={{ color: "#007bff", textDecoration: "underline" }}
                  >
                    support@skifolio.com
                  </a>
                )}
              </p>
            )}
            
            {section.list && (
              <ul style={{ listStyleType: "disc", paddingLeft: "20px", fontSize: "0.95rem", lineHeight: "1.5", color: "#444" }}>
                <li style={{ marginBottom: "4px" }}>Keep your login credentials secure and confidential.</li>
                <li style={{ marginBottom: "4px" }}>Immediately report unauthorized access or breaches.</li>
                <li style={{ marginBottom: "4px" }}>You are responsible for all activities that occur under your account.</li>
              </ul>
            )}
            
            {section.listItems && (
              <>
                <p style={{ fontSize: "0.95rem", lineHeight: "1.5", color: "#444", marginBottom: "8px" }}>
                  {section.content}
                </p>
                <ul style={{ listStyleType: "disc", paddingLeft: "20px", fontSize: "0.95rem", lineHeight: "1.5", color: "#444" }}>
                  {section.listItems.map((item, i) => (
                    <li key={i} style={{ marginBottom: "4px" }}>{item}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        ))}
      </div>
      
      <div style={{ marginTop: "20px", display: "flex", justifyContent: "space-between" }}>
        <button 
          onClick={onClose}
          style={{
            padding: "10px 16px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            background: "#918e8e",
            cursor: "pointer"
          }}
        >
          Close
        </button>
        <button 
          onClick={onAgree}
          style={{
            padding: "10px 16px",
            borderRadius: "5px",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            cursor: "pointer"
          }}
        >
          I Agree
        </button>
      </div>
      
      <div style={{ marginTop: "16px", textAlign: "center", fontSize: "0.8rem", color: "#999" }}>
        &copy; {new Date().getFullYear()} Skifolio. All rights reserved.
      </div>
    </>
  );
};

// Main Auth Component
const Auth = ({ userType, setUser }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [name, setName] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [githubRepo, setGithubRepo] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [companyWebsite, setCompanyWebsite] = useState('');
    const [isSignUp, setIsSignUp] = useState(true); // Keeping this state for internal logic
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [verifying, setVerifying] = useState(false);
    const navigate = useNavigate();
    const [checkboxChecked, setCheckboxChecked] = useState(false);
    
    // State for modal
    const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

    const handleAgree = () => {
        setAgreedToTerms(true);
        setCheckboxChecked(true);
        setIsTermsModalOpen(false);
    };

    const verifyGithubOwnership = async (repoUrl, userEmail) => {
        try {
            setVerifying(true);
            
            // Clean up the GitHub repo URL
            let cleanRepoUrl = repoUrl.trim();
            if (cleanRepoUrl.endsWith('/')) {
                cleanRepoUrl = cleanRepoUrl.slice(0, -1);
            }
            
            // Construct the API URL to fetch the latest commit
            const apiUrl = cleanRepoUrl.replace('github.com', 'api.github.com/repos') + '/commits';
            
            // Fetch the latest commit
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error('Failed to fetch repository data. Please check if the repository exists and is public.');
            }
            
            const commits = await response.json();
            if (!commits || commits.length === 0) {
                throw new Error('No commits found in this repository.');
            }
            
            // Get the latest commit
            const latestCommit = commits[0];
            
            // Get the author email directly from the commit data
            const authorEmail = latestCommit.commit.author.email.toLowerCase();
            const providedEmail = userEmail.toLowerCase();
            
            if (authorEmail !== providedEmail) {
                throw new Error('The email used for the latest commit does not match your login email.');
            }
            
            setVerifying(false);
            return true;
        } catch (error) {
            setVerifying(false);
            alert(`GitHub verification failed: ${error.message}`);
            clearInputs();
            return false;
        }
    };

    const clearInputs = () => {
        if (userType === 'applicant') {
            setName('');
            setGithubRepo('');
        } else {
            setCompanyName('');
            setCompanyWebsite('');
        }
    };
    
    const handleTermsClick = () => {
        // Display alert before opening terms modal
        alert('Please read our Terms and Conditions carefully before proceeding with registration.\n\nYou must click "I Agree" at the bottom of the terms to enable the checkbox and continue with registration.');
        setIsTermsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (isSignUp && !agreedToTerms) {
            alert('Please read and accept the Terms and Conditions before signing up.');
            return;
        }
    
        try {
            let userCredential;
    
            if (isSignUp) {
                // Validate required fields based on user type
                if (userType === 'employer' && (!companyName || !companyWebsite)) {
                    alert('Please fill in all required company information.');
                    return;
                } else if (userType === 'applicant' && (!name || !githubRepo)) {
                    alert('Please fill in all required applicant information.');
                    return;
                }
    
                // For applicants, verify GitHub ownership before proceeding
                if (userType === 'applicant') {
                    try {
                        const isGithubVerified = await verifyGithubOwnership(githubRepo, email);
                        if (!isGithubVerified) {
                            alert('GitHub verification failed. Please ensure the repository exists and you have access to it.');
                            return;
                        }
                    } catch (verifyError) {
                        console.error('GitHub verification error:', verifyError);
                        alert('Error during GitHub verification. Please try again or contact support.');
                        return;
                    }
                }
    
                // Create the user account
                userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await sendEmailVerification(userCredential.user);
                
                // Create user data based on user type
                let userData = {
                    email,
                    type: userType,
                    status: 'pending',
                    createdAt: new Date().toISOString()
                };
                
                // Add user type specific fields
                if (userType === 'applicant') {
                    userData = {
                        ...userData,
                        name,
                        githubRepo
                    };
                } else if (userType === 'employer') {
                    userData = {
                        ...userData,
                        companyName,
                        companyWebsite
                    };
                }
    
                const uid = userCredential.user.uid;
                
                // Use batch write to ensure both documents are created or neither is
                const batch = writeBatch(db);
                batch.set(doc(db, 'userAccountsToApprove', uid), userData);
                batch.set(doc(db, 'userAccountsToBeApproved', uid), userData);
                await batch.commit();
                
                alert('A verification email has been sent. Please verify before signing in.');
                await signOut(auth);
                navigate('/');
                return;
            } else {
                // Sign in logic
                userCredential = await signInWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
    
                if (!user.emailVerified) {
                    alert('Please verify your email before signing in.');
                    await signOut(auth);
                    navigate('/');
                    return;
                }
    
                const uid = user.uid;
                
                try {
                    // Check user status
                    const userDocToApprove = await getDoc(doc(db, 'userAccountsToApprove', uid));
                    
                    if (!userDocToApprove.exists()) {
                        alert('Your account is not found. Please sign up.');
                        await signOut(auth);
                        navigate('/');
                        return;
                    }
    
                    const userData = userDocToApprove.data();
                    
                    // Check if user is still pending approval
                    const userDocToBeApproved = await getDoc(doc(db, 'userAccountsToBeApproved', uid));
                    if (userDocToBeApproved.exists()) {
                        alert('Your account is pending approval. Please wait for admin approval.');
                        await signOut(auth);
                        navigate('/');
                        return;
                    }
    
                    // Check approval status
                    if (userData.status !== 'approved') {
                        alert('Your account is not yet approved. Please wait for admin approval.');
                        await signOut(auth);
                        navigate('/');
                        return;
                    }
    
                    // Login successful, set user and redirect based on user type
                    setUser(user);
                    navigate(userData.type === 'employer' ? '/employer/profile' : '/applicant/profile');
                } catch (error) {
                    console.error('Error checking user status:', error);
                    alert('Error verifying account status. Please try again later.');
                    await signOut(auth);
                    navigate('/');
                    return;
                }
            }
        } catch (error) {
            console.error('Error signing in/up:', error.code, error.message);
            
            // Provide more specific error messages
            if (error.code === 'auth/email-already-in-use') {
                alert('This email is already registered. Please use a different email or try logging in.');
            } else if (error.code === 'auth/invalid-email') {
                alert('Please enter a valid email address.');
            } else if (error.code === 'auth/weak-password') {
                alert('Password is too weak. Please use a stronger password.');
            } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                alert('Invalid email or password. Please check your credentials and try again.');
            } else {
                alert('An error occurred. Please try again later.');
            }
        }
    };
    
    const handleForgotPassword = async () => {
        if (!resetEmail) {
            alert('Please enter your email to reset the password.');
            return;
        }
        
        try {
            await sendPasswordResetEmail(auth, resetEmail);
            alert('Password reset email sent. Please check your inbox.');
        } catch (error) {
            console.error('Error sending password reset email:', error.code, error.message);
            
            if (error.code === 'auth/user-not-found') {
                alert('No account found with this email. Please check the email address.');
            } else if (error.code === 'auth/invalid-email') {
                alert('Please enter a valid email address.');
            } else {
                alert('Error sending password reset email. Please try again later.');
            }
        }
    };

    return (
        <div className="hero" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <div className="choicecontainer2" style={{ textAlign: 'center', width: '100%', maxWidth: '400px' }}>
                <form onSubmit={handleSubmit} id="formauth" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <h2 style={{ fontFamily: "times new roman" }}>{isSignUp ? 'Sign Up' : 'Sign In'} as {userType}</h2>

                    <input className="inputs" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ marginBottom: '10px', width: '100%' }} />
                    
                    <div style={{ position: 'relative', width: '100%', marginBottom: '10px' }}>
                        <input
                            className='inputs'
                            id='password'
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                paddingRight: '60px', // create space for the button
                                boxSizing: 'border-box',
                                marginLeft: '-2px'
                            }}
                        />
                        <span
                            onClick={() => setShowPassword(!showPassword)}
                            style={{
                                position: 'absolute',
                                right: '15px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                cursor: 'pointer',
                                fontSize: '14px',
                                color: 'gray',
                                userSelect: 'none',
                                marginLeft: '-2px'
                            }}
                        >
                            {showPassword ? 'Hide' : 'Show'}
                        </span>
                    </div>

                    {isSignUp && (
                        <div style={{ position: 'relative', width: '100%', marginBottom: '10px' }}>
                            <input
                                className='inputs'
                                id='confirmPassword'
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    paddingRight: '60px', // create space for the button
                                    boxSizing: 'border-box',
                                    marginLeft: '-2px'
                                }}
                            />
                            <span
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '15px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    color: 'gray',
                                    userSelect: 'none',
                                    marginLeft: '-2px'
                                }}
                            >
                                {showConfirmPassword ? 'Hide' : 'Show'}
                            </span>
                        </div>
                    )}

                    {isSignUp && userType === 'applicant' && (
                        <>
                            <input className="inputs" type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required style={{ marginBottom: '10px', width: '100%' }} />
                            <input className="inputs" type="text" placeholder="GitHub Repository URL" value={githubRepo} onChange={(e) => setGithubRepo(e.target.value)} required style={{ marginBottom: '10px', width: '100%' }} />
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                            <div style={{ width: '100%', marginBottom: '10px', position: 'relative' }}>
                                <span className="tooltip-exclamation">!</span>
                                <div className="tooltip-text">
                                    Please enter the full URL to your GitHub repository.<br />
                                    Example: <code>https://github.com/username/repository-name</code><br /><br />
                                    This is required so the system can access your portfolio for scoring.
                                </div>
                                <strong style={{ marginLeft: '10px' }}>GitHub Repository URL</strong>
                            </div>
                        </div>
                        </>
                    )}

                    {isSignUp && userType === 'employer' && (
                        <>
                            <input className="inputs" type="text" placeholder="Company Name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required style={{ marginBottom: '10px', width: '100%' }} />
                            <input className="inputs" type="url" placeholder="Company Website" value={companyWebsite} onChange={(e) => setCompanyWebsite(e.target.value)} required style={{ marginBottom: '10px', width: '100%' }} />
                        </>
                    )}

                    {isSignUp && (
                        <div style={{ marginBottom: '20px', width: '100%', display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                                <input 
                                    type="checkbox" 
                                    id="termsCheckbox"
                                    checked={checkboxChecked} 
                                    readOnly
                                    title="You must read and agree to the Terms and Conditions first"
                                    style={{ 
                                        marginRight: '8px', 
                                        marginTop: '4px',
                                        cursor: 'not-allowed', // Changes cursor to indicate it's not clickable
                                        opacity: checkboxChecked ? '1' : '0.6' // Makes it look disabled when not checked
                                    }} 
                                />
                                <label htmlFor="termsCheckbox" style={{ textAlign: 'left' }}>
                                    I agree to the{' '}
                                    <span 
                                        onClick={handleTermsClick}
                                        style={{
                                            textDecoration: 'underline',
                                            color: 'blue',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Terms and Conditions
                                    </span>
                                </label>
                            </div>
                        </div>
                    )}
                    
                    <button 
                        type="submit" 
                        className="input submit" 
                        disabled={verifying || (isSignUp && !checkboxChecked)}
                        style={{ 
                            marginBottom: '10px', 
                            width: '100%',
                            opacity: (isSignUp && !checkboxChecked) ? '0.6' : '1', // Visual feedback for disabled state
                            cursor: (isSignUp && !checkboxChecked) ? 'not-allowed' : 'pointer' // Change cursor when disabled
                        }}
                        title={isSignUp && !checkboxChecked ? "You must agree to the Terms and Conditions first" : ""}
                    >
                        {verifying ? 'Verifying...' : (isSignUp ? 'Sign Up' : 'Sign In')}
                    </button>

                    <div style={{ width: '100%', marginTop: '10px' }}>
                        <Link to="/select">
                            <button type="button" className="submit">Cancel</button>
                        </Link>
                    </div>
                    
                    {!isSignUp && (
                        <div style={{ marginTop: '10px', width: '100%', textAlign: 'center' }}>
                            <button 
                                type="button" 
                                onClick={handleForgotPassword} 
                                style={{ 
                                    background: 'none', 
                                    border: 'none', 
                                    color: 'blue', 
                                    cursor: 'pointer' 
                                }}
                            >
                                Forgot Password?
                            </button>
                        </div>
                    )}
                </form>
            </div>

            {/* Terms Modal */}
            <Modal isOpen={isTermsModalOpen} onClose={() => setIsTermsModalOpen(false)}>
                <Terms 
                    onAgree={handleAgree} 
                    onClose={() => setIsTermsModalOpen(false)} 
                />
            </Modal>
        </div>
    );
};

export default Auth;