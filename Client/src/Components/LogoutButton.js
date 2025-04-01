import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { PetContext } from '../Context/Context';
import { MDBBtn } from 'mdb-react-ui-kit';
import toast from 'react-hot-toast';

function LogoutButton() {
  const { logoutUser, loginStatus } = useContext(PetContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    if (logoutUser()) {
      toast.success('Logged out successfully');
      navigate('/');
    }
  };

  if (!loginStatus) return null;

  return (
    <MDBBtn 
      color="danger" 
      size="sm" 
      onClick={handleLogout}
      className="ms-2"
    >
      Logout
    </MDBBtn>
  );
}

export default LogoutButton; 