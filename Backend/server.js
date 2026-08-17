const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

const PORT = 5000;


// ======================================
// MIDDLEWARE
// ======================================

app.use(cors());

app.use(express.json());


// ======================================
// DATABASE FILE
// ======================================

const databasePath = path.join(
    __dirname,
    "data",
    "database.json"
);


// ======================================
// READ DATABASE
// ======================================

function readDatabase() {

    try {

        const data = fs.readFileSync(
            databasePath,
            "utf8"
        );

        return JSON.parse(data);

    } catch (error) {

        console.error(
            "Error reading database:",
            error
        );

        return {
            donors: [],
            requests: []
        };
    }
}


// ======================================
// WRITE DATABASE
// ======================================

function writeDatabase(data) {

    try {

        fs.writeFileSync(
            databasePath,
            JSON.stringify(data, null, 2)
        );

        return true;

    } catch (error) {

        console.error(
            "Error writing database:",
            error
        );

        return false;
    }
}


// ======================================
// HOME / TEST ROUTE
// ======================================

app.get("/", (req, res) => {

    res.json({

        message:
            "Blood Donation & Emergency Donor Finder API",

        status: "Server is running",

        endpoints: {

            donors: "/api/donors",

            requests: "/api/requests"

        }

    });

});


// ==================================================
//                  DONOR APIs
// ==================================================


// ======================================
// CREATE DONOR
// POST /api/donors
// ======================================

app.post("/api/donors", (req, res) => {

    const {

        name,
        bloodGroup,
        age,
        phone,
        location,
        availability

    } = req.body;


    // Validation

    if (
        !name ||
        !bloodGroup ||
        !age ||
        !phone ||
        !location ||
        !availability
    ) {

        return res.status(400).json({

            message:
                "All donor fields are required."

        });

    }


    if (age < 18 || age > 65) {

        return res.status(400).json({

            message:
                "Donor age must be between 18 and 65."

        });

    }


    if (!/^[0-9]{10}$/.test(phone)) {

        return res.status(400).json({

            message:
                "Phone number must contain exactly 10 digits."

        });

    }


    const database = readDatabase();


    const newDonor = {

        id: Date.now(),

        name: name.trim(),

        bloodGroup: bloodGroup,

        age: Number(age),

        phone: phone,

        location: location.trim(),

        availability: availability,

        createdAt: new Date().toISOString()

    };


    database.donors.push(newDonor);


    const saved =
        writeDatabase(database);


    if (!saved) {

        return res.status(500).json({

            message:
                "Unable to save donor."

        });

    }


    res.status(201).json({

        message:
            "Donor registered successfully.",

        donor: newDonor

    });

});


// ======================================
// GET ALL DONORS
// GET /api/donors
// ======================================

app.get("/api/donors", (req, res) => {

    const database = readDatabase();


    let donors = database.donors;


    // Search

    const search =
        req.query.search;


    if (search) {

        const searchText =
            search.toLowerCase();


        donors = donors.filter(donor =>

            donor.name
                .toLowerCase()
                .includes(searchText)

            ||

            donor.location
                .toLowerCase()
                .includes(searchText)

        );

    }


    // Blood group filter

    const bloodGroup =
        req.query.bloodGroup;


    if (bloodGroup) {

        donors = donors.filter(donor =>

            donor.bloodGroup === bloodGroup

        );

    }


    // Availability filter

    const availability =
        req.query.availability;


    if (availability) {

        donors = donors.filter(donor =>

            donor.availability === availability

        );

    }


    res.status(200).json({

        count: donors.length,

        donors: donors

    });

});


// ======================================
// GET SINGLE DONOR
// GET /api/donors/:id
// ======================================

app.get("/api/donors/:id", (req, res) => {

    const database = readDatabase();


    const id =
        Number(req.params.id);


    const donor =
        database.donors.find(
            donor => donor.id === id
        );


    if (!donor) {

        return res.status(404).json({

            message:
                "Donor not found."

        });

    }


    res.json({

        donor: donor

    });

});


// ======================================
// UPDATE DONOR
// PUT /api/donors/:id
// ======================================

app.put("/api/donors/:id", (req, res) => {

    const database = readDatabase();


    const id =
        Number(req.params.id);


    const donorIndex =
        database.donors.findIndex(
            donor => donor.id === id
        );


    if (donorIndex === -1) {

        return res.status(404).json({

            message:
                "Donor not found."

        });

    }


    const {

        name,
        bloodGroup,
        age,
        phone,
        location,
        availability

    } = req.body;


    if (
        !name ||
        !bloodGroup ||
        !age ||
        !phone ||
        !location ||
        !availability
    ) {

        return res.status(400).json({

            message:
                "All donor fields are required."

        });

    }


    if (age < 18 || age > 65) {

        return res.status(400).json({

            message:
                "Age must be between 18 and 65."

        });

    }


    if (!/^[0-9]{10}$/.test(phone)) {

        return res.status(400).json({

            message:
                "Invalid phone number."

        });

    }


    database.donors[donorIndex] = {

        ...database.donors[donorIndex],

        name: name.trim(),

        bloodGroup,

        age: Number(age),

        phone,

        location: location.trim(),

        availability,

        updatedAt: new Date().toISOString()

    };


    writeDatabase(database);


    res.json({

        message:
            "Donor updated successfully.",

        donor:
            database.donors[donorIndex]

    });

});


// ======================================
// DELETE DONOR
// DELETE /api/donors/:id
// ======================================

app.delete("/api/donors/:id", (req, res) => {

    const database = readDatabase();


    const id =
        Number(req.params.id);


    const donorIndex =
        database.donors.findIndex(
            donor => donor.id === id
        );


    if (donorIndex === -1) {

        return res.status(404).json({

            message:
                "Donor not found."

        });

    }


    const deletedDonor =
        database.donors.splice(
            donorIndex,
            1
        )[0];


    writeDatabase(database);


    res.json({

        message:
            "Donor deleted successfully.",

        donor:
            deletedDonor

    });

});


// ==================================================
//              EMERGENCY REQUEST APIs
// ==================================================


// ======================================
// CREATE EMERGENCY REQUEST
// POST /api/requests
// ======================================

app.post("/api/requests", (req, res) => {

    const {

        patientName,
        bloodGroup,
        quantity,
        hospital,
        location,
        requiredDate,
        phone,
        description

    } = req.body;


    // Validation

    if (
        !patientName ||
        !bloodGroup ||
        !quantity ||
        !hospital ||
        !location ||
        !requiredDate ||
        !phone ||
        !description
    ) {

        return res.status(400).json({

            message:
                "All emergency request fields are required."

        });

    }


    if (Number(quantity) <= 0) {

        return res.status(400).json({

            message:
                "Blood quantity must be greater than zero."

        });

    }


    if (!/^[0-9]{10}$/.test(phone)) {

        return res.status(400).json({

            message:
                "Invalid contact number."

        });

    }


    const database = readDatabase();


    const newRequest = {

        id: Date.now(),

        patientName:
            patientName.trim(),

        bloodGroup:

            bloodGroup,

        quantity:

            Number(quantity),

        hospital:

            hospital.trim(),

        location:

            location.trim(),

        requiredDate:

            requiredDate,

        phone:

            phone,

        description:

            description.trim(),

        status:

            "Active",

        createdAt:

            new Date().toISOString()

    };


    database.requests.push(
        newRequest
    );


    const saved =
        writeDatabase(database);


    if (!saved) {

        return res.status(500).json({

            message:
                "Unable to save emergency request."

        });

    }


    res.status(201).json({

        message:
            "Emergency request created successfully.",

        request:
            newRequest

    });

});


// ======================================
// GET ALL REQUESTS
// GET /api/requests
// ======================================

app.get("/api/requests", (req, res) => {

    const database = readDatabase();


    let requests =
        database.requests;


    // Filter by status

    const status =
        req.query.status;


    if (status) {

        requests =
            requests.filter(request =>

                request.status === status

            );

    }


    // Filter by blood group

    const bloodGroup =
        req.query.bloodGroup;


    if (bloodGroup) {

        requests =
            requests.filter(request =>

                request.bloodGroup === bloodGroup

            );

    }


    res.json({

        count:
            requests.length,

        requests:
            requests

    });

});


// ======================================
// GET SINGLE REQUEST
// GET /api/requests/:id
// ======================================

app.get("/api/requests/:id", (req, res) => {

    const database =
        readDatabase();


    const id =
        Number(req.params.id);


    const request =
        database.requests.find(
            request => request.id === id
        );


    if (!request) {

        return res.status(404).json({

            message:
                "Emergency request not found."

        });

    }


    res.json({

        request:
            request

    });

});


// ======================================
// UPDATE REQUEST
// PUT /api/requests/:id
// ======================================

app.put("/api/requests/:id", (req, res) => {

    const database =
        readDatabase();


    const id =
        Number(req.params.id);


    const requestIndex =
        database.requests.findIndex(
            request => request.id === id
        );


    if (requestIndex === -1) {

        return res.status(404).json({

            message:
                "Emergency request not found."

        });

    }


    const {

        patientName,
        bloodGroup,
        quantity,
        hospital,
        location,
        requiredDate,
        phone,
        description

    } = req.body;


    if (
        !patientName ||
        !bloodGroup ||
        !quantity ||
        !hospital ||
        !location ||
        !requiredDate ||
        !phone ||
        !description
    ) {

        return res.status(400).json({

            message:
                "All request fields are required."

        });

    }


    database.requests[requestIndex] = {

        ...database.requests[requestIndex],

        patientName:
            patientName.trim(),

        bloodGroup,

        quantity:
            Number(quantity),

        hospital:
            hospital.trim(),

        location:
            location.trim(),

        requiredDate,

        phone,

        description:
            description.trim(),

        updatedAt:
            new Date().toISOString()

    };


    writeDatabase(database);


    res.json({

        message:
            "Emergency request updated successfully.",

        request:
            database.requests[requestIndex]

    });

});


// ======================================
// UPDATE REQUEST STATUS
// PATCH /api/requests/:id/status
// ======================================

app.patch(
    "/api/requests/:id/status",
    (req, res) => {

        const database =
            readDatabase();


        const id =
            Number(req.params.id);


        const request =
            database.requests.find(
                request => request.id === id
            );


        if (!request) {

            return res.status(404).json({

                message:
                    "Emergency request not found."

            });

        }


        const { status } =
            req.body;


        const validStatuses = [

            "Active",

            "Fulfilled",

            "Cancelled"

        ];


        if (
            !validStatuses.includes(status)
        ) {

            return res.status(400).json({

                message:
                    "Invalid status. Use Active, Fulfilled or Cancelled."

            });

        }


        request.status =
            status;


        request.updatedAt =
            new Date().toISOString();


        writeDatabase(database);


        res.json({

            message:
                "Request status updated successfully.",

            request:
                request

        });

    }
);


// ======================================
// DELETE REQUEST
// DELETE /api/requests/:id
// ======================================

app.delete("/api/requests/:id", (req, res) => {

    const database =
        readDatabase();


    const id =
        Number(req.params.id);


    const requestIndex =
        database.requests.findIndex(
            request => request.id === id
        );


    if (requestIndex === -1) {

        return res.status(404).json({

            message:
                "Emergency request not found."

        });

    }


    const deletedRequest =
        database.requests.splice(
            requestIndex,
            1
        )[0];


    writeDatabase(database);


    res.json({

        message:
            "Emergency request deleted successfully.",

        request:
            deletedRequest

    });

});


// ======================================
// 404 ROUTE
// ======================================

app.use((req, res) => {

    res.status(404).json({

        message:
            "API endpoint not found."

    });

});


// ======================================
// START SERVER
// ======================================

app.listen(PORT, () => {

    console.log(
        `Blood Donation API running at http://localhost:${PORT}`
    );

});