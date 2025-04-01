import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBBtn,
  MDBIcon
} from 'mdb-react-ui-kit';

function PaymentSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const membershipType = queryParams.get('type') || 'basic';

  useEffect(() => {
    // You could refresh user data here if needed
  }, []);

  return (
    <MDBContainer className="my-5">
      <MDBRow className="justify-content-center">
        <MDBCol md="8">
          <MDBCard className="text-center">
            <MDBCardBody>
              <div className="py-4">
                <MDBIcon fas icon="check-circle" size="4x" className="text-success mb-4" />
                <h2 className="mb-4">Payment Successful!</h2>
                <p className="lead mb-4">
                  Thank you for purchasing the {membershipType === 'premium' ? 'Premium' : 'Basic'} membership.
                  Your account has been upgraded and you now have access to all the features.
                </p>
                <MDBBtn color="primary" onClick={() => navigate('/')}>
                  Start Exploring Pet Services
                </MDBBtn>
              </div>
            </MDBCardBody>
          </MDBCard>
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );
}

export default PaymentSuccess; 