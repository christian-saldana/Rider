import React from 'react';
import { Link, Navigate } from 'react-router-dom';

import TripCard from '../common/TripCard';
import { useGetTripsQuery } from '../../features/tripSliceRTKQuery';
import ExpirationLogin from '../common/ExpirationLogin';

function RiderDashboard() {
  const { data: trips, isLoading, error } = useGetTripsQuery()

  if (isLoading) {
    return <h1>Loading</h1>
  }
//Instead of showing the modal here, display the modal in the main return. Import the functions so that there isn't a compiling error. 
//Then the navigate will work.
  if (error) {
    if (error.status === 401) {
        return (
            <ExpirationLogin />
        )
    }
    else {
        <Navigate to='/' />
    }
}

  const getRequestedTrips = () => {
    return trips.filter((trip: any) => {
      return trip.status === 'REQUESTED';
    });
  }

  const getCurrentTrips = () => {
    return trips.filter((trip: any) => {
      return (
        trip.status === 'STARTED' || trip.status === 'IN_PROGRESS'
      );
    });
  };
  const getCompletedTrips = () => {
    return trips.filter((trip: any) => {
      return trip.status === 'COMPLETED';
    });
  };

  return (
    <>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">Home</Link></li>
          <li className="breadcrumb-item active" aria-current="page">Dashboard</li>
        </ol>
      </nav>
      <TripCard
        title='Requested Trips'
        trips={getRequestedTrips()}
        group='rider'
        otherGroup='driver'
      />
      <TripCard
        title='Current Trip'
        trips={getCurrentTrips()}
        group='rider'
        otherGroup='driver'
      />
      <TripCard
        title='Recent Trips'
        trips={getCompletedTrips()}
        group='rider'
        otherGroup='driver'
      />
    </>
  );
}

export default RiderDashboard;