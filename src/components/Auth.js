
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
import { writeBatch,doc, setDoc, getDoc } from 'firebase/firestore';

const Auth = ({ userType, setUser }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [name, setName] = useState('');
    const [githubRepo, setGithubRepo] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [companyWebsite, setCompanyWebsite] = useState('');
    const [isSignUp, setIsSignUp] = useState(true);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [verifying, setVerifying] = useState(false);
    const navigate = useNavigate();

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

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (isSignUp && !agreedToTerms) {
            alert('Please accept the terms and conditions.');
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
                // 8UT2PQRG7CT4X5G9A7NXZFSU
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
                    
                    <div style={{ position: 'relative', width: '100%', marginBottom: '10px',  display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <input className="inputs" type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%' }} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'black' }}>
                            {showPassword ? 'Hide' : 'Show'}
                        </button>
                    </div>

                    {isSignUp && userType === 'applicant' && (
                        <>
                            <input className="inputs" type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required style={{ marginBottom: '10px', width: '100%' }} />
                            <input className="inputs" type="text" placeholder="GitHub Repository URL" value={githubRepo} onChange={(e) => setGithubRepo(e.target.value)} required style={{ marginBottom: '10px', width: '100%' }} />
                        </>
                    )}

                    {isSignUp && userType === 'employer' && (
                        <>
                            <input className="inputs" type="text" placeholder="Company Name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required style={{ marginBottom: '10px', width: '100%' }} />
                            <input className="inputs" type="url" placeholder="Company Website" value={companyWebsite} onChange={(e) => setCompanyWebsite(e.target.value)} required style={{ marginBottom: '10px', width: '100%' }} />
                        </>
                    )}

                    {isSignUp && (
                        <div style={{ marginBottom: '20px' }}>
                            <input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} style={{ marginRight: '5px' }} />
                            <label>
                                I agree to the <a href="/terms" target="_blank" rel="noopener noreferrer">Terms and Conditions</a>
                            </label>
                        </div>
                    )}
                    
                    <button type="submit" className="input submit" disabled={verifying}>
                        {verifying ? 'Verifying...' : (isSignUp ? 'Sign Up' : 'Sign In')}
                    </button>
                    <Link to="/select">
                        <button className="submit">Cancel</button>
                    </Link>
                    {!isSignUp && (
                        <button type="button" onClick={handleForgotPassword} style={{ background: 'none', border: 'none', color: 'blue', cursor: 'pointer', marginTop: '10px' }}>
                            Forgot Password?
                        </button>
                    )}
                </form>
            </div>
        </div>
    );
};

export default Auth;