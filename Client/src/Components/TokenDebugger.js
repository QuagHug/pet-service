import React, { useEffect, useState } from 'react';
import { MDBCard, MDBCardBody, MDBCardTitle, MDBCardText, MDBBtn } from 'mdb-react-ui-kit';

function TokenDebugger() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userID, setUserID] = useState(localStorage.getItem('userID'));
  
  useEffect(() => {
    // Update state when localStorage changes
    const handleStorageChange = () => {
      setToken(localStorage.getItem('token'));
      setUserID(localStorage.getItem('userID'));
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Check every second (for debugging)
    const interval = setInterval(() => {
      setToken(localStorage.getItem('token'));
      setUserID(localStorage.getItem('userID'));
    }, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);
  
  return (
    <MDBCard className="m-3">
      <MDBCardBody>
        <MDBCardTitle>Authentication Debug</MDBCardTitle>
        <MDBCardText>
          <strong>Token:</strong> {token ? `${token.substring(0, 20)}...` : 'Not set'}
        </MDBCardText>
        <MDBCardText>
          <strong>User ID:</strong> {userID || 'Not set'}
        </MDBCardText>
        <MDBBtn 
          color="danger" 
          size="sm"
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('userID');
            setToken(null);
            setUserID(null);
          }}
        >
          Clear Storage
        </MDBBtn>
      </MDBCardBody>
    </MDBCard>
  );
}

export default TokenDebugger; 