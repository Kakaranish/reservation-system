import React, { useState, useEffect } from "react";
import { ObjectID } from "mongodb";
import axios from 'axios';
import '../assets/css/RoomPage.css';
import noImagePlaceholder from "../assets/icons/no-image.svg";
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from "moment";
import 'react-big-calendar/lib/css/react-big-calendar.css';

const images = require.context('../assets/images/amenities', true);

moment.locale('ko', {
    week: {
        dow: 1,
        doy: 1
    }
});
const localizer = momentLocalizer(moment);

const mapAmenityNameToAssetFilename = amenityName => {
    switch (amenityName) {
        case "amtTV":
            return "tv.svg";
        case "amtMicrophone":
            return "mic.svg";
        case "amtProjector":
            return "projector.svg";
        case "amtPhone":
            return "phone.svg";
    }
}

const RoomPage = ({ match }) => {
    const roomId = match.params.id;
    const [message, setMessage] = useState(null);
    const [room, setRoom] = useState(null);

    useEffect(() => {
        const getRoom = async roomId => {
            let result;
            try {
                result = await axios(`/rooms/${roomId}`);
                setRoom(result.data);
            }
            catch (error) {
                setMessage(`Unable to get room with id ${roomId}. Some error occured :C`);
            }
        }
        if (ObjectID.isValid(roomId)) getRoom(roomId);
    }, []);


    const existingReservations = [
        {
            start: moment.utc('2020-04-01').startOf('day').toDate(),
            end: moment.utc('2020-04-02').startOf('day').toDate(),
            title: "res1"
        },
        {
            start: moment.utc('2020-04-04').startOf('day').toDate(),
            end: moment.utc('2020-04-06').startOf('day').toDate(),
            title: "res2"
        }
    ];

    /**
     * 
     * @param {Array} reservations 
     */
    const mapReservationsToEvents = reservations => {
        return reservations.map(reservation => {
            return {
                start: reservation.start,
                end: moment(reservation.end).startOf('day').add(1, 'days').subtract(1, 'milliseconds').toDate(),
                title: reservation.title,
                x: "XDDDDDD"
            };
        })
    }

    const [events, setEvents] = useState({
        dateIntervals: mapReservationsToEvents(existingReservations)
    });
    const [selectedInterval, setSelectedInterval] = useState(null);


    const onSelectSlot = slotInfo => {
        const newEvent = {
            start: slotInfo.start,
            end: moment(slotInfo.end).startOf('day').add(1, 'days').subtract(1, 'milliseconds').toDate(),
            title: "POTENTIAL RESERVATION",
            isCreatedByUser: true,
            allDay: true
        };

        const probablyColidingEvents = !selectedInterval
            ? events.dateIntervals
            : events.dateIntervals.slice(0, -1);
        const overlapWithOtherEvent = probablyColidingEvents.some(event =>
            newEvent.start.getTime() <= event.end.getTime() &&
            newEvent.end.getTime() >= event.start.getTime());
        if (overlapWithOtherEvent) return;

        setSelectedInterval(newEvent);
        setEvents({
            dateIntervals: [...probablyColidingEvents, newEvent]
        });
    };

    // const eventStyleGetter = (event, start, end, isSelected) => {
    //     let style;
    //     if (event.isCreatedByUser) {
    //         style = {
    //             backgroundColor: "red",
    //             borderRadius: '0px',
    //             opacity: 0.8,
    //             color: 'black',
    //             border: '0px',
    //             display: 'block'
    //         };
    //     }
    //     else {
    //         style = {
    //             backgroundColor: "blue",
    //             borderRadius: '0px',
    //             opacity: 0.8,
    //             color: 'black',
    //             border: '0px',
    //             display: 'block'
    //         };
    //     }
    //     return {
    //         style: style
    //     };
    // }

    const MyCalendar = () => (
        <div>
            <Calendar
                defaultDate={moment().toDate()}
                views={["month"]}
                localizer={localizer}
                startAccessor="start"
                events={events.dateIntervals}
                endAccessor="end"
                // components={
                //     {
                //         day: {
                //             event
                //         }
                //     }
                // }
                style={{ height: 500 }}
                selectable={true}
                onSelectSlot={onSelectSlot}
                min={moment().toDate()}
                max={moment().add(5, "days").toDate()}
            />
        </div>
    )

    if (!ObjectID.isValid(roomId)) {
        return (
            <div className="row">
                <div className="col-12">
                    <h2>There is no room with {roomId} id!</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="row">
            <div className="col-12">
                {
                    (() => {
                        if (!room) return <h3>{message}</h3>
                        return <div className="container bg-white">
                            <div className="row">
                                <div className="col-12">
                                    <h3 className="room-page-title pt-3 pb-3">{room.name}</h3>
                                </div>
                            </div>

                            <div className="row mt-2">
                                <div className="col-md-7">
                                    <h5 className="title-color">Description</h5>
                                    <p className="global-font font-weight-light" style={{ color: "#6A6972" }}>
                                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin non odio et odio condimentum egestas. Duis viverra pulvinar odio, sit amet luctus nulla mattis quis. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Pellentesque urna libero, ullamcorper ac nunc et, sollicitudin tincidunt ex. Donec pharetra purus sed nibh ultricies ullamcorper. Sed ut urna velit. Sed fringilla neque lorem, tincidunt euismod risus congue eu. Vestibulum libero enim, iaculis at arcu id, suscipit feugiat metus.
                                    </p>
                                </div>

                                <div className="col-md-5">
                                    <div class="row">
                                        <img className="card-img pr-md-4 mt-1 mb-2 room-page-image" src={room.photo ? room.photo : noImagePlaceholder} />
                                    </div>

                                    <h5 className="title-color mb-3">Amenities</h5>

                                    <div className="row pb-3">
                                        <div className="d-flex justify-content-between col-md-10">
                                            {
                                                room.amenities.sort().map(amenity => {
                                                    let img_src = images("./" + mapAmenityNameToAssetFilename(amenity));
                                                    return <img className="room-page-amenity" src={img_src} alt={amenity} key={amenity} />
                                                })
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <MyCalendar />


                        </div>
                    })()
                }
            </div>
        </div>


    );
};

export default RoomPage;