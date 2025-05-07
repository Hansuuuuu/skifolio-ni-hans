import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, sendPasswordResetEmail, signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const SignIn = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleSignIn = async (e) => {
        e.preventDefault();
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const applicantDoc = await getDoc(doc(db, 'applicants', user.uid));
            const employerDoc = await getDoc(doc(db, 'employers', user.uid));
            const userDocToBeApproved = await getDoc(doc(db, 'userAccountsToBeApproved', user.uid));

            if (userDocToBeApproved.exists()) {
                alert('Your account is pending approval. Please wait for admin approval.');
                await signOut(auth);
                navigate('/');
                return;
            }

            if (applicantDoc.exists()) {
                navigate('/applicant/profile');
            } else if (employerDoc.exists()) {
                navigate('/employer/profile');
            } else {
                console.error('User type not found in database.');
            }
        } catch (error) {
            console.error('Error signing in:', error);
            alert('Failed to sign in. Please check your email and password.');
        }
    };

    const handleForgotPassword = async () => {
        if (!email) {
            alert('Please enter your email to reset your password.');
            return;
        }

        const confirmation = window.confirm(`Send password reset email to ${email}?`);
        if (!confirmation) return;

        try {
            await sendPasswordResetEmail(auth, email);
            alert(`A password reset link has been sent to ${email}. Please check your inbox.`);
        } catch (error) {
            console.error('Error sending password reset email:', error);
            if (error.code === 'auth/user-not-found') {
                alert('No account found with this email. Please check and try again.');
            } else if (error.code === 'auth/invalid-email') {
                alert('Invalid email format. Please enter a valid email.');
            } else {
                alert('Failed to send password reset email. Please try again later.');
            }
        }
    };

    return (
        <div className='hero' style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <div className='choicecontainer' style={{ textAlign: 'center', width: '100%', maxWidth: '400px' }}>
                <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '100px' }}>
                    <h2 style={{ fontFamily: "Times New Roman" }}>Log In</h2>
                    <input
                        id='email'
                        className='inputs'
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ marginBottom: '10px', width: '100%' }}
                    />

                    
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

                    <button className="input-submit" type="submit">Log In</button>
                    <p onClick={handleForgotPassword} style={{ marginTop: '10px', cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}>Forgot Password?</p>
                </form>
            </div>
        </div>
    );
};

export default SignIn;
