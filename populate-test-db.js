import mongoose from 'mongoose';
import User from './src/models/user-model';
import Room from './src/models/room-model';
import Reservation from './src/models/reservation-model';
import moment, { ISO_8601 } from 'moment';
const parseObjectId = require('./src/common').parseObjectId;

require('dotenv').config();
const currentDbVarName = process.env.MONGO_CURRENT_DB_URI;
const dbName = process.env.DB_NAME_TEST;

(async () => {

    // -------------------------------------------------------------------------
    // -- CONFIG

    await mongoose.connect(process.env[currentDbVarName], {
        dbName: dbName,
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    await mongoose.connection.dropDatabase();

    // -------------------------------------------------------------------------
    // -- HELPERS

    const dummyInterval = {
        fromDate: moment('2020-04-01T00:00:00.000Z', ISO_8601).toDate(),
        toDate: moment('2020-04-30T00:00:00.000Z', ISO_8601).toDate()
    };

    /**
     * @param {String} userId 
     * @param {String} roomId 
     */
    const createDummyReservation = (userId, roomId) => {
        return new Reservation({
            _id: mongoose.Types.ObjectId(),
            fromDate: dummyInterval.fromDate,
            toDate: dummyInterval.toDate,
            userId: userId,
            roomId: roomId,
            pricePerDay: 400,
            totalPrice: 400,
            status: "ACCEPTED",
            createDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate(),
            updateDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate()
        });
    }

    /**
     * @param {String} id
     * @param {String} userId 
     * @param {String} roomId 
     */
    const createDummyReservationWithId = (id, userId, roomId) => {
        return new Reservation({
            _id: parseObjectId(id),
            fromDate: dummyInterval.fromDate,
            toDate: dummyInterval.toDate,
            userId: parseObjectId(userId),
            roomId: parseObjectId(roomId),
            pricePerDay: 400,
            totalPrice: 400,
            status: "ACCEPTED",
            createDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate(),
            updateDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate()
        });
    }

    // -------------------------------------------------------------------------
    // -- COMMON

    const user = new User({
        _id: parseObjectId('5ea54fe32d431462827c2c5e'),
        email: "user@mail.com",
        password: "$2a$10$vI8aWBnW3fID.ZQ4/zo1G.a29kwv8V6jU5L4nb.F5/EJxDqZ/w6DG", // hashed '123'
        firstName: "user",
        lastName: "user-lastname",
        role: "USER"
    });

    const admin = new User({
        _id: mongoose.Types.ObjectId("5ea5501566815162f73bad80"),
        email: "admin@mail.com",
        password: "$2a$10$vI8aWBnW3fID.ZQ4/zo1G.a29kwv8V6jU5L4nb.F5/EJxDqZ/w6DG", // hashed '123'
        firstName: 'admin',
        lastName: 'admin-lastname',
        role: "ADMIN"
    });

    await User.insertMany([
        user, admin
    ]);

    // -------------------------------------------------------------------------
    // -- /rooms

    {
        const room1 = new Room({
            _id: parseObjectId('5ea55125e95cc70df70870f7'),
            name: "Conference Room #1",
            location: "Krakow",
            capacity: 20,
            pricePerDay: 300,
            description: "Some description 1",
            amenities: [
                "amtTV", "amtMicrophone", "amtProjector"
            ],
            dows: [
                "dowMonday", "dowTuesday", "dowThursday", "dowFriday", "dowSunday"
            ],
            photoUrl: '/some/path'
        })

        await room1.save();

        await Reservation.insertMany([
            new Reservation({
                fromDate: moment('2020-04-03T00:00:00.000Z', ISO_8601).toDate(),
                toDate: moment('2020-04-03T00:00:00.000Z', ISO_8601).toDate(),
                userId: user._id,
                roomId: room1._id,
                pricePerDay: 300,
                totalPrice: 600,
                status: "ACCEPTED",
                createDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate(),
                updateDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate()
            }),
            new Reservation({
                fromDate: moment('2020-04-05T00:00:00.000Z', ISO_8601).toDate(),
                toDate: moment('2020-04-30T00:00:00.000Z', ISO_8601).toDate(),
                userId: user._id,
                roomId: room1._id,
                pricePerDay: 300,
                totalPrice: 600,
                status: "ACCEPTED",
                createDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate(),
                updateDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate()
            })
        ]);

        const room2 = new Room({
            _id: parseObjectId('5ea551627698ad8c1c5a4759'),
            name: "Conference Room #2",
            location: "Warsaw",
            capacity: 10,
            pricePerDay: 400.99,
            description: "Some description 2",
            amenities: [
                "amtTV", "amtMicrophone", "amtProjector", "amtPhone"
            ],
            dows: [
                "dowMonday", "dowThursday", "dowFriday"
            ],
            photoUrl: '/some/path2'
        });
        await room2.save();

        await Reservation.insertMany([
            new Reservation({
                fromDate: moment('2020-04-02T00:00:00.000Z', ISO_8601).toDate(),
                toDate: moment('2020-04-04T00:00:00.000Z', ISO_8601).toDate(),
                userId: user._id,
                roomId: room2._id,
                pricePerDay: 300,
                totalPrice: 600,
                status: "ACCEPTED",
                createDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate(),
                updateDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate()
            }),
            new Reservation({
                fromDate: moment('2020-04-06T00:00:00.000Z', ISO_8601).toDate(),
                toDate: moment('2020-04-30T00:00:00.000Z', ISO_8601).toDate(),
                userId: user._id,
                roomId: room2._id,
                pricePerDay: 300,
                totalPrice: 600,
                status: "ACCEPTED",
                createDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate(),
                updateDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate()
            })
        ]);
    }

    // -------------------------------------------------------------------------
    // -- /room/:roomId/reservations
    // -- Getting reservations for room 

    {
        const room = new Room({
            _id: parseObjectId('5ea5e3423724e5ff90e7df45'),
            name: "Room to get reservations",
            location: "Krakow",
            capacity: 20,
            pricePerDay: 300,
            description: "Some description 1",
            amenities: [
                "amtTV", "amtMicrophone", "amtProjector"
            ],
            dows: [
                "dowMonday", "dowTuesday", "dowThursday", "dowFriday", "dowSunday"
            ],
            photoUrl: '/some/path/5ea5e3423724e5ff90e7df45'
        });
        await room.save();
    
        await Reservation.insertMany([
            new Reservation({
                _id: parseObjectId('5ea5e6b2f0322ac00ff284ac'),
                fromDate: moment('2020-05-01T00:00:00.000Z', ISO_8601).toDate(),
                toDate: moment('2020-05-01T00:00:00.000Z', ISO_8601).toDate(),
                userId: user._id,
                roomId: room._id,
                pricePerDay: 400,
                totalPrice: 400,
                status: "ACCEPTED",
                createDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate(),
                updateDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate()
            }),
            new Reservation({
                _id: parseObjectId('5ea5e3beb9f264420ea8799d'),
                fromDate: moment('2020-05-02T00:00:00.000Z', ISO_8601).toDate(),
                toDate: moment('2020-05-02T00:00:00.000Z', ISO_8601).toDate(),
                userId: user._id,
                roomId: room._id,
                pricePerDay: 400,
                totalPrice: 400,
                status: "ACCEPTED",
                createDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate(),
                updateDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate()
            }),
            createDummyReservation(user._id, room._id)
        ]);
    }


    // -------------------------------------------------------------------------
    // /reservation/create

    {
        const room = await new Room({
            _id: parseObjectId('5ea6fda6e8ecbe2dad9f1c23'),
            name: "Conference Room 5ea6fda6e8ecbe2dad9f1c23",
            location: "Krakow",
            capacity: 20,
            pricePerDay: 300,
            description: "Some description 1",
            amenities: [
                "amtTV", "amtMicrophone", "amtProjector"
            ],
            dows: [
                "dowMonday", "dowTuesday", "dowThursday", "dowFriday", "dowSunday"
            ],
            photoUrl: '/some/path'
        });
        await room.save();
    
        await createDummyReservation(user._id, room._id).save();
        
        await new Reservation({
            _id: parseObjectId('5ea7216dd625f8cb279733d5'),
            fromDate: moment('2020-05-01T00:00:00.000Z', ISO_8601).toDate(),
            toDate: moment('2020-05-01T00:00:00.000Z', ISO_8601).toDate(),
            userId: user._id,
            roomId: room._id,
            pricePerDay: 400,
            totalPrice: 400,
            status: "ACCEPTED",
            createDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate(),
            updateDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate()
        }).save()
    }

    // -------------------------------------------------------------------------
    // chnageReservationStatus

    await new Reservation({
        _id: parseObjectId('5ea5ee95db7d4bdb587a6952'),
        fromDate: moment('2020-05-03T00:00:00.000Z', ISO_8601).toDate(),
        toDate: moment('2020-05-03T00:00:00.000Z', ISO_8601).toDate(),
        userId: parseObjectId('5ea5501566815162f73bad80'), // user2
        roomId: parseObjectId('5ea5e3423724e5ff90e7df45'),
        pricePerDay: 400,
        totalPrice: 400,
        status: "ACCEPTED",
        createDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate(),
        updateDate: moment('2020-01-01T00:00:00.000Z', ISO_8601).toDate()
    }).save()

    await mongoose.connection.close();

    console.log(`OK - '${dbName}' has been populated.`);
})();