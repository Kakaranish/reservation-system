import express from "express";
import { ObjectID } from "mongodb";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import dbClient from "../DbClient";
import passport from "passport";

require('../auth');
const dbActions = require('../DbQueries');
const router = express.Router();
const dbName = 'reservation-system';

const resSystemDbClient = dbClient();

router.get('/rooms', async (req, res) => {
    const startDateMs = Date.parse(req.body.startDate);
    const startDate = startDateMs ? new Date(startDateMs) : null;
    const endDateMs = Date.parse(req.body.endDate);
    const endDate = endDateMs ? new Date(endDateMs) : null;

    let errors = [];
    if (!startDate) errors.push(`'startDate' is not ISO 8601 datetime format.`);
    if (!endDate) errors.push(`'endDate' is not ISO 8601 datetime format.`);
    if (errors.length > 0) return res.json({
        "errors": errors
    });

    const dateInterval = {
        "startDate": startDate,
        "endDate": endDate
    };
    try {
        const dbResult = await resSystemDbClient.withDb(async db => {
            const availableRoomsIds = await dbActions.getAvailableRoomsIds(db, dateInterval);
            const roomPreviews = await dbActions.getRoomPreviews(db, availableRoomsIds);
            return roomPreviews;
        });
        res.status(500).json({
            "roomIds": dbResult
        });
    } catch (error) {
        console.log(`Error: ${error}`);
        res.status(500).json({
            message: "Error: Internal error"
        });
    }
});

router.get('/rooms/:id', async (req, res) => {
    if (!ObjectID.isValid(req.params.id)) return res.status(400).json({
        message: `Error: '${req.params.id} is not valid ObjectID'`
    });
    const roomId = new ObjectID(req.params.id);

    try {
        const room = await resSystemDbClient.withDb(async db => {
            return await db.collection('rooms').findOne({ "_id": new ObjectID(roomId) })
        });
        return res.status(200).json(room);
    } catch (error) {
        console.log(`Error: ${error}`);
        res.status(500).json({
            message: "Internal error"
        });
    }
});

// USER & ADMIN
router.post('/create-room', async (req, res) => {
    passport.authenticate('jwt', { session: false }, async (error, user) => {
        if (!user.role) return res.status(401).json({
            message: "Unauthorized access"
        });

        const roomJson = {
            name: req.body.name,
            location: req.body.location,
            capacity: req.body.capacity,
            pricePerDay: req.body.pricePerDay,
            description: req.body.description,
            amenities: req.body.amenities ? JSON.parse(req.body.amenities) : [],
            availability: req.body.availability ? JSON.parse(req.body.availability) : []
        };
        const processingErrors = processRoomJson(roomJson);
        if (processingErrors.length) {
            return res.status(400).json({
                errors: processingErrors
            })
        };

        if (!req.files) {
            return res.status(400).json({
                errors: ["No file uploaded"]
            });
        }
        const file = req.files.file;
        const uploadDirPath = path.resolve(__dirname, "..", "..", "client/public/uploads/")
        const newFilename = uuidv4() + path.extname(file.name);

        file.mv(`${uploadDirPath}/${newFilename}`, error => {
            if (error) {
                console.log(error)
                return res.status(500).json({
                    message: `Error: ${error}`
                });
            }
        });

        roomJson.photo = `/uploads/${newFilename}`;

        try {
            const insertedId = await resSystemDbClient.withDb(dbName, async db => {
                return await db.collection('rooms').insertOne(roomJson).then(result => {
                    return result.insertedId;
                });
            })
            res.status(200).json({
                "roomId": insertedId
            });
        } catch (error) {
            console.log(`Error: ${error}`);
            res.status(500).json({
                message: "Error: Internal error"
            });
        }
    })(req, res);
});

const processRoomJson = roomJson => {
    let errors = [];
    if (!roomJson.name) errors.push("'name' is not provided");
    if (!roomJson.location) errors.push("'location' is not provided");

    roomJson.capacity = parseInt(roomJson.capacity);
    if (!roomJson.capacity) errors.push("'capacity' is not provided or it's not integer");

    roomJson.pricePerDay = parseFloat(roomJson.pricePerDay);
    if (!roomJson.pricePerDay) errors.push("'pricePerDay' is not provided or it's not float");

    if (!roomJson.amenities.length) errors.push("Room must have at least 1 amenity.");
    if (!roomJson.availability.length) errors.push("Room must be avaialble for at least one DoW.")

    return errors;
}

export default router;