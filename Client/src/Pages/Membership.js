import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PetContext } from '../Context/Context';
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBCardTitle,
  MDBCardText,
  MDBBtn,
  MDBIcon,
  MDBSpinner
} from 'mdb-react-ui-kit';
import { axios } from '../Utils/Axios';
import toast from 'react-hot-toast';

function Membership() {
  const { loginStatus } = useContext(PetContext);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const userID = localStorage.getItem('userID');

  const handlePayment = async () => {
    if (!loginStatus) {
      toast.error('Please login to upgrade your membership');
      navigate('/login');
      return;
    }

    setLoading(true);
    
    try {
      console.log("Making payment request to:", `/payment/momo/${userID}`);
      const response = await axios.post(`/payment/momo/${userID}`);
      console.log("Payment response:", response.data);
      
      if (response.data && response.data.status === 'success' && response.data.data && response.data.data.payUrl) {
        console.log("Payment URL:", response.data.data.payUrl);
        // Redirect to MoMo payment page
        window.location.href = response.data.data.payUrl;
      } else {
        console.log("Payment creation failed:", response.data?.message);
        toast.error(response.data?.message || 'Failed to create payment');
      }
    } catch (error) {
      console.error('Payment error:', error);
      
      if (error.response?.status === 401) {
        toast.error('Your session has expired. Please login again.');
        navigate('/login');
      } else {
        toast.error(error.response?.data?.message || 'An error occurred while processing your payment');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <MDBContainer className="my-5">
      <MDBRow className="justify-content-center">
        <MDBCol md="8" lg="6">
          <MDBCard className="shadow-lg">
            <MDBCardBody className="p-5">
              <div className="text-center mb-5">
                <MDBIcon fas icon="crown" size="3x" className="text-warning mb-3" />
                <MDBCardTitle tag="h2" className="fw-bold">Premium Membership</MDBCardTitle>
                <p className="lead text-muted">Unlock all pet services search features</p>
              </div>

              <MDBRow className="mb-4">
                <MDBCol md="12">
                  <h4 className="mb-3">Benefits:</h4>
                  <ul className="fa-ul">
                    <li className="mb-3">
                      <span className="fa-li"><MDBIcon fas icon="check-circle" className="text-success" /></span>
                      <strong>Unlimited searches</strong> for pet services
                    </li>
                    <li className="mb-3">
                      <span className="fa-li"><MDBIcon fas icon="check-circle" className="text-success" /></span>
                      <strong>Advanced filters</strong> to find the perfect service
                    </li>
                    <li className="mb-3">
                      <span className="fa-li"><MDBIcon fas icon="check-circle" className="text-success" /></span>
                      <strong>Nearby service</strong> location finder
                    </li>
                    <li className="mb-3">
                      <span className="fa-li"><MDBIcon fas icon="check-circle" className="text-success" /></span>
                      <strong>Save favorites</strong> for quick access
                    </li>
                    <li className="mb-3">
                      <span className="fa-li"><MDBIcon fas icon="check-circle" className="text-success" /></span>
                      <strong>Premium support</strong> from our team
                    </li>
                  </ul>
                </MDBCol>
              </MDBRow>

              <div className="text-center mb-4">
                <h3 className="mb-3">50,000 VND</h3>
                <p className="text-muted">for 30 days of premium access</p>
              </div>

              <MDBBtn 
                color="success" 
                className="w-100 mb-4" 
                size="lg"
                onClick={handlePayment}
                disabled={loading}
              >
                {loading ? (
                  <MDBSpinner size="sm" role="status" tag="span" className="me-2" />
                ) : (
                  <MDBIcon fab icon="cc-visa" className="me-2" />
                )}
                Pay with MoMo
              </MDBBtn>

              <div className="text-center mt-4">
                <small className="text-muted">
                  By purchasing, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
                </small>
              </div>
            </MDBCardBody>
          </MDBCard>
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );
}

export default Membership; 