import React, { useEffect, useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PetContext } from '../Context/Context';
import {
  MDBContainer,
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

function PaymentResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const { fetchUserMembership } = useContext(PetContext);
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState({
    status: 'processing',
    message: 'Processing payment result...',
    orderId: '',
    transId: ''
  });

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const status = queryParams.get('status');
    const message = queryParams.get('message');
    const orderId = queryParams.get('orderId');
    const transId = queryParams.get('transId');
    const userId = queryParams.get('userId');

    console.log("Payment result received:", { status, message, orderId, transId, userId });

    if (status && message) {
      setPaymentData({
        status,
        message,
        orderId: orderId || '',
        transId: transId || ''
      });

      // If payment was successful and we have a user ID, refresh membership status
      if (status === 'success' && userId) {
        fetchUserMembership();
      }
    } else {
      setPaymentData({
        status: 'error',
        message: 'Invalid payment response',
        orderId: '',
        transId: ''
      });
    }

    setLoading(false);
  }, [location.search, fetchUserMembership]);

  const getStatusIcon = () => {
    switch (paymentData.status) {
      case 'success':
        return <MDBIcon fas icon="check-circle" className="text-success" size="4x" />;
      case 'failure':
        return <MDBIcon fas icon="times-circle" className="text-danger" size="4x" />;
      case 'error':
        return <MDBIcon fas icon="exclamation-triangle" className="text-warning" size="4x" />;
      default:
        return <MDBSpinner className="mx-2" />;
    }
  };

  const getStatusTitle = () => {
    switch (paymentData.status) {
      case 'success':
        return 'Payment Successful';
      case 'failure':
        return 'Payment Failed';
      case 'error':
        return 'Payment Error';
      default:
        return 'Processing Payment';
    }
  };

  const getStatusColor = () => {
    switch (paymentData.status) {
      case 'success':
        return 'success';
      case 'failure':
        return 'danger';
      case 'error':
        return 'warning';
      default:
        return 'info';
    }
  };

  return (
    <MDBContainer className="my-5">
      <MDBCard className="text-center">
        <MDBCardBody>
          {loading ? (
            <MDBSpinner className="my-4" />
          ) : (
            <>
              <div className="my-4">
                {getStatusIcon()}
              </div>
              <MDBCardTitle tag="h3" className={`text-${getStatusColor()}`}>
                {getStatusTitle()}
              </MDBCardTitle>
              <MDBCardText className="my-4">
                {paymentData.message}
              </MDBCardText>
              
              {paymentData.orderId && (
                <MDBCardText>
                  <strong>Order ID:</strong> {paymentData.orderId}
                </MDBCardText>
              )}
              
              {paymentData.transId && (
                <MDBCardText>
                  <strong>Transaction ID:</strong> {paymentData.transId}
                </MDBCardText>
              )}
              
              <div className="d-flex justify-content-center mt-4">
                <MDBBtn color="primary" onClick={() => navigate('/membership')}>
                  Back to Membership
                </MDBBtn>
                
                <MDBBtn color="secondary" className="ms-3" onClick={() => navigate('/')}>
                  Go to Home
                </MDBBtn>
              </div>
            </>
          )}
        </MDBCardBody>
      </MDBCard>
    </MDBContainer>
  );
}

export default PaymentResult; 