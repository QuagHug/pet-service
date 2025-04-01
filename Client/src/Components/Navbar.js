import React, { useState, useContext } from 'react';
import { PetContext } from '../Context/Context';
import { useNavigate } from 'react-router-dom';
import {
  MDBContainer,
  MDBNavbar,
  MDBNavbarToggler,
  MDBNavbarNav,
  MDBNavbarItem,
  MDBNavbarLink,
  MDBIcon,
  MDBCollapse,
  MDBBadge,
  MDBBtn,
  MDBInputGroup
} from 'mdb-react-ui-kit';
import '../Styles/Navbar.css';
import toast from 'react-hot-toast';

const Navbar = () => {
  const [searchInput, setSearchInput] = useState('');
  const [showCollapse, setShowCollapse] = useState(false);
  const { loginStatus, favorites, searchServices, membership, logoutUser } = useContext(PetContext);
  const name = localStorage.getItem('name');
  const navigate = useNavigate();

  const toggleNavbar = () => setShowCollapse(!showCollapse);

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    
    const results = await searchServices(searchInput);
    navigate('/', { state: { searchResults: results, searchQuery: searchInput } });
    setSearchInput('');
  };

  const handleLogout = () => {
    logoutUser();
    toast.success('Successfully logged out');
    navigate('/');
  };

  const handleNavigation = (path) => {
    navigate(path);
    setShowCollapse(false);
  };

  return (
    <MDBNavbar expand="lg" light bgColor="light" fixed="top">
      <MDBContainer>
        <MDBNavbarLink onClick={() => handleNavigation('/')}>
          <span className="navbar-brand mb-0 h1">
            <MDBIcon fas icon="paw" className="me-2" />
            PetServices
          </span>
        </MDBNavbarLink>

        <MDBNavbarToggler type="button" aria-expanded="false" aria-label="Toggle navigation" onClick={toggleNavbar}>
          <MDBIcon icon="bars" fas />
        </MDBNavbarToggler>

        <MDBCollapse navbar show={showCollapse}>
          <MDBNavbarNav className="me-auto mb-2 mb-lg-0">
            <form className="d-flex input-group w-auto" onSubmit={handleSearchSubmit}>
              <MDBInputGroup>
                <input
                  type="search"
                  className="form-control"
                  placeholder="Search services..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
                <MDBBtn color="primary" type="submit">
                  <MDBIcon fas icon="search" />
                </MDBBtn>
              </MDBInputGroup>
            </form>
          </MDBNavbarNav>

          <div className="d-flex align-items-center">
            {loginStatus ? (
              <>
                <MDBNavbarItem>
                  <MDBNavbarLink onClick={() => handleNavigation('/favorites')} className="me-3">
                    <MDBIcon far icon="heart" />
                    {favorites.length > 0 && (
                      <MDBBadge color="danger" notification pill>
                        {favorites.length}
                      </MDBBadge>
                    )}
                  </MDBNavbarLink>
                </MDBNavbarItem>
                
                <div className="dropdown">
                  <a
                    className="dropdown-toggle d-flex align-items-center hidden-arrow"
                    href="#"
                    id="navbarDropdownMenuAvatar"
                    role="button"
                    data-mdb-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <MDBIcon fas icon="user-circle" className="me-1" />
                    <span className="me-2">{name}</span>
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdownMenuAvatar">
                    <li>
                      <a className="dropdown-item" href="#" onClick={() => handleNavigation('/profile')}>
                        My Profile
                      </a>
                    </li>
                    <li>
                      <a className="dropdown-item" href="#" onClick={handleLogout}>
                        Logout
                      </a>
                    </li>
                  </ul>
                </div>

                {loginStatus && (
                  <MDBNavbarItem className="d-flex align-items-center">
                    {membership && membership.status === 'active' ? (
                      <MDBBadge color='warning' pill className='mx-2 p-2'>
                        <MDBIcon fas icon='crown' className='me-1' />
                        Premium
                      </MDBBadge>
                    ) : (
                      <MDBBtn 
                        color='warning' 
                        size='sm' 
                        className='mx-2'
                        onClick={() => handleNavigation('/membership')}
                      >
                        <MDBIcon far icon='gem' className='me-1' />
                        Upgrade Now
                      </MDBBtn>
                    )}
                  </MDBNavbarItem>
                )}
              </>
            ) : (
              <>
                <MDBBtn color="link" onClick={() => handleNavigation('/login')}>
                  Login
                </MDBBtn>
                <MDBBtn color="primary" onClick={() => handleNavigation('/register')}>
                  Sign Up
                </MDBBtn>
              </>
            )}
          </div>
        </MDBCollapse>
      </MDBContainer>
    </MDBNavbar>
  );
};

export default Navbar;
