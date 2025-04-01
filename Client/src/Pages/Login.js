import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { PetContext } from '../Context/Context';
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBInput,
  MDBBtn,
  MDBIcon,
  MDBSpinner
} from 'mdb-react-ui-kit';
import toast from 'react-hot-toast';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading } = useContext(PetContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    try {
      console.log("Submitting login form with email:", email);
      const success = await login(email, password);
      console.log("Login result:", success);
      
      if (success) {
        // Verify token was stored
        const token = localStorage.getItem('token');
        console.log("Token after login:", token ? "Set" : "Not set");
        
        // Navigate to home page
        navigate('/');
      } else {
        toast.error('Invalid email or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred during login');
    }
  };

  return (
    <MDBContainer className="my-5">
      <MDBRow className="justify-content-center">
        <MDBCol md="6">
          <MDBCard>
            <MDBCardBody className="p-5">
              <div className="text-center mb-5">
                <MDBIcon fas icon="paw" size="3x" className="text-primary mb-3" />
                <h2 className="fw-bold">Login to Pet Services</h2>
                <p className="text-muted">Access your account to find the best pet services</p>
              </div>
              
              <form onSubmit={handleSubmit}>
                <MDBInput
                  wrapperClass="mb-4"
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                
                <MDBInput
                  wrapperClass="mb-4"
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                
                <div className="d-flex justify-content-between mb-4">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="rememberMe"
                    />
                    <label className="form-check-label" htmlFor="rememberMe">
                      Remember me
                    </label>
                  </div>
                  <a href="#!" className="text-primary">Forgot password?</a>
                </div>
                
                <MDBBtn 
                  type="submit" 
                  color="primary" 
                  block 
                  className="mb-4"
                  disabled={loading}
                >
                  {loading ? (
                    <MDBSpinner size="sm" role="status" tag="span" className="me-2" />
                  ) : (
                    <MDBIcon fas icon="sign-in-alt" className="me-2" />
                  )}
                  Login
                </MDBBtn>
              </form>
              
              <div className="text-center">
                <p>
                  Don't have an account? <a href="/register" className="text-primary">Register</a>
                </p>
              </div>
            </MDBCardBody>
          </MDBCard>
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );
}

export default Login;
