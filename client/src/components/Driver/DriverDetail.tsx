import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom'

import TripMedia from '../common/TripMedia';
import { getTrip } from '../../services/TripService';
import { useUpdateTripMutation } from '../../features/tripSliceRTKQuery'
import { selectUser } from '../../features/userSlice'


function DriverDetail() {
    const [trip, setTrip] = useState<any>({});
    const { id } = useParams()
    const userInfo = useSelector(selectUser)
    const [updateTrip] = useUpdateTripMutation();

    const updateTripStatus = (status: string) => {
        const driver = userInfo;
        const updatedTrip = { ...trip, driver, status };
        updateTrip({
            ...updatedTrip,
            driver: updatedTrip?.driver?.id,
            rider: updatedTrip.rider.id
        });
        setTrip(updatedTrip);
    };

    useEffect(() => {
        const loadTrip = async (id: string | undefined) => {
            try {
                const response = await getTrip(id)
                setTrip(response.data)
            } catch(error:any) {
                setTrip({})
                console.error(error)
            }
        }
        loadTrip(id);
    }, [id]);

    let tripMedia;

    if (trip === null) {
        tripMedia = <>Loading...</>;
    } else {
        tripMedia = (
            <TripMedia
                trip={trip}
                otherGroup='rider'
            />
        )
    }

    return (
        <div className="row">
            <div className="col-lg-12">
                <nav aria-label="breadcrumb">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item"><Link to="/driver">Dashboard</Link></li>
                        <li className="breadcrumb-item active" aria-current="page">Trip</li>
                    </ol>
                </nav>
                <div className='card mb-3' data-cy='trip-card'>
                    <div className="card-header">Trip</div>
                    <div className="card-body">{tripMedia}</div>
                    <div className="card-footer">
                        {
                            trip !== null && trip.status === 'REQUESTED' && (
                                <button
                                    className="btn-lg btn-primary w-100 fs-5"
                                    data-cy='status-button'
                                    onClick={() => updateTripStatus('STARTED')}
                                >Drive to pick up
                                </button>
                            )
                        }
                        {
                            trip !== null && trip.status === 'STARTED' && (
                                <button
                                    className="btn-lg btn-primary w-100 fs-5"
                                    data-cy='status-button'
                                    onClick={() => updateTripStatus('IN_PROGRESS')}
                                >Drive to drop off
                                </button>
                            )
                        }
                        {
                            trip !== null && trip.status === 'IN_PROGRESS' && (
                                <button
                                    className="btn-lg btn-primary w-100 fs-5"
                                    data-cy='status-button'
                                    onClick={() => updateTripStatus('COMPLETED')}
                                >Complete trip
                                </button>
                            )
                        }
                        {
                            trip !== null && !['REQUESTED', 'STARTED', 'IN_PROGRESS'].includes(trip.status) && (
                                <span className='text-center'>Completed</span>
                            )
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DriverDetail;