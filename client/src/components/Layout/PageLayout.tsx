import React from 'react';
import { useSelector } from 'react-redux'
import { Routes, Route, Link } from 'react-router-dom';

import { selectUser, selectAuthenticated } from '../../features/userSlice';
import { RequireAuth } from '../../auth/Authorization'
import { DriverLayout } from '../Driver/DriverLayout';
import { RiderLayout } from '../Rider/RiderLayout';
import { LandingPage } from '../LandingPage/LandingPage';
import LogoutButton from './LogoutButton';
import { GlobalModal } from './GlobalModal';

const PageLayout = () => {
    const userInfo = useSelector(selectUser)
    const auth = useSelector(selectAuthenticated)
    console.log('inside pagelayout')
    return (
        <>
            <nav className="navbar navbar-expand-lg navbar-light bg-light position-fixed top-0 d-flex justify-content-between w-100">
                <Link to='/' className="navbar-brand">Taxi</Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
                    <ul className="navbar-nav">
                        {userInfo?.group === 'rider' &&
                            <li className='me-auto navbar-nav'>
                                <Link to='/rider/request'>Request a trip</Link>
                            </li>}
                        {auth &&
                            <li className='me-auto nav-item'>
                                <LogoutButton />
                            </li>
                        }
                    </ul>
                </div>
            </nav>
            <div className="d-flex position-relative flex-column justify-content-center align-items-center px-2">
                <GlobalModal>
                    <Routes>
                        <Route index element={<LandingPage />} />
                        <Route path='/driver/*' element={<RequireAuth userInfo={userInfo} group='driver' ><DriverLayout /></RequireAuth>} />
                        <Route path='/rider/*' element={<RequireAuth userInfo={userInfo} group='rider' > <RiderLayout /></RequireAuth>} />
                    </Routes>
                </GlobalModal>
            </div>
        </>
    )
}

export default PageLayout