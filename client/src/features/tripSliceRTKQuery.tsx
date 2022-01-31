import { createApi } from '@reduxjs/toolkit/query/react';
import { toast } from 'react-toastify';
import { webSocket } from 'rxjs/webSocket';

import { axiosBaseQuery } from '../http-common';
import getToken from '../utils/getToken'
import { StoreState } from '../app/store'
import { Trip, CreateTrip, Message } from './types'
import { RootState } from '@reduxjs/toolkit/dist/query/core/apiState';

type GetStateType = StoreState & RootState<any, any, string>


const riderToast = (trip: any) => {
    console.log('trip rider', trip)
    if (trip.data.status === 'STARTED') {
        return toast.info(`Driver ${trip.data.driver.username} is coming to pick you up.`);
    } else if (trip.data.status === 'IN_PROGRESS') {
        return toast.info(`Driver ${trip.data.driver.username} is headed to your destination.`);
    } else if (trip.data.status === 'COMPLETED' && trip.action !== 'delete') {
        return toast.info(`Driver ${trip.data.driver.username} has dropped you off.`);
    }
}

const driverToast = (trip: any) => {
    console.log('trip driver', trip)
    if (trip.action === 'create' && trip.data.driver === null) {
        return toast.info(`Rider ${trip.data.rider.username} has requested a trip.`)
    }
    else if (trip.action === 'delete' && (trip.data.status === 'STARTED' || trip.data.status === 'IN_PROGRESS')) {
        return toast.info(`Rider ${trip.data.rider.username} has canceled their trip.`)
    }
}

let ReceiveSub: any
let _socket:any
let Initiate:any
let Receive: any

const connect = () => {
    if (!_socket || _socket.closed) {
        _socket = webSocket(`ws://localhost:8003/taxi/?token=${getToken()}`);
        
        Initiate = _socket.multiplex(
            () => ({subscribe: 'Initiate'}),
            () => ({unsubscribe: 'Initiate'}),
            (message:any) => message.type === 'initiate.message'
        )

        Receive = _socket.multiplex(
            () => ({subscribe: 'Reciever'}),
            () => ({unsubscribe: 'Reciever'}),
            (message:any) => message.type === 'receive.message'
        )
    }
};

export const tripApi = createApi({
    baseQuery: axiosBaseQuery(),
    endpoints: (builder) => ({
        createTrip: builder.mutation<Trip, CreateTrip>({
            queryFn: async (tripContent) => {
                return new Promise(resolve => {Initiate.subscribe((message: any) =>
                    resolve({data: message.data}))
                    const message = {type: 'create.trip', data: tripContent};
                    _socket.next(message)
                })
            },
            async onQueryStarted({...tripContent}, { dispatch, queryFulfilled }) {
                try {
                  const { data: newTrip } = await queryFulfilled
                  dispatch(tripApi.util.updateQueryData('getTrips', undefined, (draft) => {
                        draft.push(newTrip)
                    })
                  )
                } catch {}
              },
        }),
        deleteTrip: builder.mutation<Trip, Trip>({
            queryFn: async (tripContent) => {
                return new Promise(resolve => {Initiate.subscribe((message: any) => resolve({data: message.data}))
                    const message = {type: 'delete.trip', data: tripContent}
                    _socket.next(message)
                })
            },
            async onQueryStarted({...tripContent}, { dispatch, queryFulfilled }) {
                  const patchResult = dispatch(
                    tripApi.util.updateQueryData('getTrips', undefined, (draft) => {
                        const trip = draft.find((trip: Trip) => trip.id === tripContent.id)
                        if(trip) {
                            const indexOfElement = draft.indexOf(trip)
                            draft.splice(indexOfElement, 1);
                        }
                    })
                  )
                  try {
                    await queryFulfilled
                  } catch {
                    patchResult.undo()
                  }
              }
        }),
        updateTrip: builder.mutation<Trip, Trip>({
            queryFn: async (tripContent) => {
                connect()
                return new Promise(resolve => {
                    Initiate.subscribe((message: any) => resolve({data: message.data}))
                    const message = {type: 'update.trip', data: tripContent}
                    _socket.next(message)
                })
            },
        }),
        getTrips: builder.query<Trip[], void>({
            query: () => ({ url: '/api/trip/', method: 'GET' }),
            async onCacheEntryAdded(arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved, getState }) {
                try {
                    await cacheDataLoaded;
                    connect()
                    ReceiveSub = Receive.subscribe((message: any) => {
                        updateCachedData((draft) => {
                            //Had to create a new type 'GetStateType' because the default RootState<any, any, string> did not seem to 
                            //have the properties I needed accessible. I combined RootState with the exported store state.
                            //Possibly bad practice or possibly a bug within RTK Query. 
                            let driverUsername = getState() as GetStateType
                            console.log(driverUsername)
                            if (message.action === 'update' && driverUsername.user.user.group !== 'driver') {
                                const trip = draft.find((trip: Trip) => trip.id === message.data.id)
                                if(trip) {
                                    trip.status = message.data.status
                                    trip.driver = message.data.driver
                                    riderToast(message)
                                }
                            }
                            else if (message.action === 'delete' && (message.data.driver.username !== driverUsername.user.user.username || message.sender === 'rider')) {
                                const trip = draft.find((trip: Trip) => trip.id === message.data.id)
                                if(trip) {
                                    const indexOfElement = draft.indexOf(trip)
                                    draft.splice(indexOfElement, 1);
                                    driverToast(message)
                                }
                            }
                            else if (message.action === 'create') {
                                draft.push(message.data)
                                driverToast(message)
                            }
                        })
                    });
                } catch(error: any){
                    console.error('error', error)
                 }
                await cacheEntryRemoved
                ReceiveSub.unsubscribe();
            }
        }),
    }),
});

export const { useGetTripsQuery, useCreateTripMutation, useDeleteTripMutation, useUpdateTripMutation, util}: any = tripApi
export { connect, _socket } 