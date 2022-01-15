import React from 'react';

import TripMedia from './TripMedia';

function TripCard ({ title, trips, group, otherGroup }: any) {
  let cardBody;
  let mediaList;

  if (trips.length === 0) {
    cardBody = <>No trips.</>
  } else {
    mediaList = trips.map((trip: any) =>
      <TripMedia
        trip={trip}
        group={group}
        otherGroup={otherGroup}
        key={trip.id}
      />
    )
    cardBody = <ul className='list-unstyled mb-0'>{mediaList}</ul>
  }
  return (
    <div className='card mb-3' data-cy='trip-card'>
      <div className="card-header">{title}</div>
      <div className="card-body">{cardBody}</div>
    </div>
  )
}

export default TripCard;