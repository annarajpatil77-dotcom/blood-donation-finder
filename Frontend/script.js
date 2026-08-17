// ================================
// DATA
// ================================

let donors = JSON.parse(localStorage.getItem("donors")) || [];

let requests = JSON.parse(localStorage.getItem("requests")) || [];


// ================================
// SAVE DATA
// ================================

function saveData() {

    localStorage.setItem(
        "donors",
        JSON.stringify(donors)
    );

    localStorage.setItem(
        "requests",
        JSON.stringify(requests)
    );
}


// ================================
// DONOR REGISTRATION
// ================================

document
    .getElementById("donorForm")
    .addEventListener("submit", function(event) {

        event.preventDefault();


        const name =
            document.getElementById("donorName").value.trim();

        const bloodGroup =
            document.getElementById("donorBloodGroup").value;

        const age =
            document.getElementById("donorAge").value;

        const phone =
            document.getElementById("donorPhone").value.trim();

        const location =
            document.getElementById("donorLocation").value.trim();

        const availability =
            document.getElementById("donorAvailability").value;


        // Validation

        if (name.length < 3) {

            alert("Please enter a valid name.");

            return;
        }


        if (age < 18 || age > 65) {

            alert("Donor age must be between 18 and 65.");

            return;
        }


        if (!/^[0-9]{10}$/.test(phone)) {

            alert("Please enter a valid 10-digit phone number.");

            return;
        }


        const donor = {

            id: Date.now(),

            name: name,

            bloodGroup: bloodGroup,

            age: age,

            phone: phone,

            location: location,

            availability: availability

        };


        donors.push(donor);

        saveData();

        displayDonors();

        this.reset();


        alert("Donor registered successfully!");

    });


// ================================
// DISPLAY DONORS
// ================================

function displayDonors() {

    const donorList =
        document.getElementById("donorList");


    const search =
        document
            .getElementById("donorSearch")
            .value
            .toLowerCase();


    const bloodFilter =
        document
            .getElementById("bloodFilter")
            .value;


    donorList.innerHTML = "";


    const filteredDonors = donors.filter(function(donor) {

        const matchesSearch =

            donor.name
                .toLowerCase()
                .includes(search)

            ||

            donor.location
                .toLowerCase()
                .includes(search);


        const matchesBlood =

            bloodFilter === ""

            ||

            donor.bloodGroup === bloodFilter;


        return matchesSearch && matchesBlood;

    });


    if (filteredDonors.length === 0) {

        donorList.innerHTML =

            `<p>No donors found.</p>`;

        return;
    }


    filteredDonors.forEach(function(donor) {

        const card =
            document.createElement("div");

        card.className = "card";


        card.innerHTML = `

            <div class="blood-group">
                ${donor.bloodGroup}
            </div>

            <h3>${donor.name}</h3>

            <p>
                <strong>Age:</strong>
                ${donor.age}
            </p>

            <p>
                <strong>Phone:</strong>
                ${donor.phone}
            </p>

            <p>
                <strong>Location:</strong>
                ${donor.location}
            </p>

            <p class="${
                donor.availability === "Available"
                    ? "available"
                    : "not-available"
            }">

                ${donor.availability}

            </p>

            <button
                class="btn"
                onclick="deleteDonor(${donor.id})">

                Remove Donor

            </button>
        `;


        donorList.appendChild(card);

    });

}


// ================================
// SEARCH DONORS
// ================================

document
    .getElementById("donorSearch")
    .addEventListener(
        "input",
        displayDonors
    );


document
    .getElementById("bloodFilter")
    .addEventListener(
        "change",
        displayDonors
    );


// ================================
// DELETE DONOR
// ================================

function deleteDonor(id) {

    const confirmDelete =
        confirm(
            "Are you sure you want to remove this donor?"
        );


    if (!confirmDelete) {

        return;
    }


    donors =
        donors.filter(function(donor) {

            return donor.id !== id;

        });


    saveData();

    displayDonors();

}


// ================================
// EMERGENCY REQUEST
// ================================

document
    .getElementById("requestForm")
    .addEventListener("submit", function(event) {

        event.preventDefault();


        const patientName =
            document
                .getElementById("patientName")
                .value
                .trim();


        const bloodGroup =
            document
                .getElementById("requiredBloodGroup")
                .value;


        const quantity =
            document
                .getElementById("bloodQuantity")
                .value;


        const hospital =
            document
                .getElementById("hospital")
                .value
                .trim();


        const location =
            document
                .getElementById("requestLocation")
                .value
                .trim();


        const requiredDate =
            document
                .getElementById("requiredDate")
                .value;


        const phone =
            document
                .getElementById("requestPhone")
                .value
                .trim();


        const description =
            document
                .getElementById("description")
                .value
                .trim();


        // Validation

        if (patientName.length < 3) {

            alert("Please enter a valid patient name.");

            return;
        }


        if (quantity <= 0) {

            alert("Quantity must be greater than zero.");

            return;
        }


        if (!/^[0-9]{10}$/.test(phone)) {

            alert(
                "Please enter a valid 10-digit contact number."
            );

            return;
        }


        const request = {

            id: Date.now(),

            patientName: patientName,

            bloodGroup: bloodGroup,

            quantity: quantity,

            hospital: hospital,

            location: location,

            requiredDate: requiredDate,

            phone: phone,

            description: description,

            status: "Active"

        };


        requests.push(request);

        saveData();

        displayRequests();

        this.reset();


        alert(
            "Emergency blood request created successfully!"
        );

    });


// ================================
// DISPLAY REQUESTS
// ================================

function displayRequests() {

    const requestList =
        document.getElementById("requestList");


    requestList.innerHTML = "";


    if (requests.length === 0) {

        requestList.innerHTML =

            `<p>No emergency requests available.</p>`;

        return;
    }


    requests.forEach(function(request) {

        const card =
            document.createElement("div");

        card.className = "card";


        card.innerHTML = `

            <div class="blood-group">
                ${request.bloodGroup}
            </div>

            <h3>
                Emergency Request
            </h3>

            <p>
                <strong>Patient:</strong>
                ${request.patientName}
            </p>

            <p>
                <strong>Hospital:</strong>
                ${request.hospital}
            </p>

            <p>
                <strong>Location:</strong>
                ${request.location}
            </p>

            <p>
                <strong>Quantity:</strong>
                ${request.quantity} unit(s)
            </p>

            <p>
                <strong>Required:</strong>
                ${request.requiredDate}
            </p>

            <p>
                <strong>Contact:</strong>
                ${request.phone}
            </p>

            <p>
                <strong>Description:</strong>
                ${request.description}
            </p>

            <p>
                <strong>Status:</strong>

                <span class="${
                    request.status === "Active"
                        ? "available"
                        : "not-available"
                }">

                    ${request.status}

                </span>

            </p>

            <button
                class="btn"
                onclick="updateRequestStatus(${request.id})">

                Update Status

            </button>

            <button
                class="btn"
                onclick="deleteRequest(${request.id})">

                Delete Request

            </button>

        `;


        requestList.appendChild(card);

    });

}


// ================================
// UPDATE REQUEST STATUS
// ================================

function updateRequestStatus(id) {

    const request =
        requests.find(function(request) {

            return request.id === id;

        });


    if (!request) {

        alert("Request not found.");

        return;
    }


    const newStatus =
        prompt(
            "Enter status: Active, Fulfilled, Cancelled",
            request.status
        );


    if (!newStatus) {

        return;
    }


    const validStatuses = [

        "Active",

        "Fulfilled",

        "Cancelled"

    ];


    if (!validStatuses.includes(newStatus)) {

        alert(
            "Invalid status. Use Active, Fulfilled or Cancelled."
        );

        return;
    }


    request.status = newStatus;

    saveData();

    displayRequests();

}


// ================================
// DELETE REQUEST
// ================================

function deleteRequest(id) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this request?"
        );


    if (!confirmDelete) {

        return;
    }


    requests =
        requests.filter(function(request) {

            return request.id !== id;

        });


    saveData();

    displayRequests();

}


// ================================
// INITIAL LOAD
// ================================

displayDonors();

displayRequests();