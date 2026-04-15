let bookings = JSON.parse(localStorage.getItem("bookings")) || [];

let drivers = [
  { id: 1, name: "Driver 1", status: "Available" },
  { id: 2, name: "Driver 2", status: "Available" },
  { id: 3, name: "Driver 3", status: "On Job" }
];

function save() {
  localStorage.setItem("bookings", JSON.stringify(bookings));
}

function openBooking() {
  document.getElementById("bookingModal").style.display = "block";
  loadDrivers();
}

function closeBooking() {
  document.getElementById("bookingModal").style.display = "none";
}

function loadDrivers() {
  let select = document.getElementById("driverSelect");
  select.innerHTML = "";
  drivers.forEach(d => {
    select.innerHTML += `<option>${d.name}</option>`;
  });
}

async function calculateFare() {
  let pickup = document.getElementById("pickup").value;
  let dropoff = document.getElementById("dropoff").value;

  if (!pickup || !dropoff) {
    alert("Enter pickup and dropoff");
    return;
  }

  try {
    let pRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${pickup}`);
    let dRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${dropoff}`);

    let pData = await pRes.json();
    let dData = await dRes.json();

    if (!pData.length || !dData.length) {
      alert("Location not found");
      return;
    }

    let p1 = pData[0];
    let p2 = dData[0];

    let routeRes = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${p1.lon},${p1.lat};${p2.lon},${p2.lat}?overview=false`
    );

    let routeData = await routeRes.json();

    let distanceMiles = routeData.routes[0].distance / 1609;

    let fare = calculateTariff(distanceMiles);

    document.getElementById("fare").value =
      `£${fare.toFixed(2)} (${distanceMiles.toFixed(2)} miles)`;

  } catch (err) {
    alert("Error calculating fare");
  }
}

function calculateTariff(distance) {
  let baseFare = 5;
  let fare = baseFare;

  if (distance <= 1) {
    fare += distance * 3;
  } else if (distance <= 3) {
    fare += (1 * 3) + ((distance - 1) * 2.5);
  } else {
    fare += (1 * 3) + (2 * 2.5) + ((distance - 3) * 2);
  }

  let hour = new Date().getHours();
  if (hour >= 22 || hour < 6) {
    fare *= 1.3;
  }

  return fare;
}

function addBooking() {
  let booking = {
    id: Date.now(),
    name: name.value,
    phone: phone.value,
    pickup: pickup.value,
    dropoff: dropoff.value,
    fare: fare.value,
    driver: driverSelect.value,
    status: "Pending"
  };

  bookings.push(booking);
  save();
  display();
  closeBooking();
}

function display() {
  let table = document.getElementById("bookingTable");
  table.innerHTML = "";

  bookings.forEach(b => {
    table.innerHTML += `
      <tr>
        <td>${b.name}</td>
        <td>${b.phone}</td>
        <td>${b.pickup}</td>
        <td>${b.dropoff}</td>
        <td>${b.fare}</td>
        <td>${b.status}</td>
        <td>${b.driver}</td>
        <td>
          <button onclick="dispatch(${b.id})">Dispatch</button>
          <button onclick="complete(${b.id})">Complete</button>
          <button onclick="remove(${b.id})">Delete</button>
        </td>
      </tr>
    `;
  });

  updateDriverPanels();
}

function dispatch(id) {
  let b = bookings.find(x => x.id === id);
  b.status = "Dispatched";
  save();
  display();
}

function complete(id) {
  let b = bookings.find(x => x.id === id);
  b.status = "Completed";
  save();
  display();
}

function remove(id) {
  bookings = bookings.filter(x => x.id !== id);
  save();
  display();
}

function searchCustomer() {
  let phone = document.getElementById("searchPhone").value;
  let filtered = bookings.filter(b => b.phone.includes(phone));

  let table = document.getElementById("bookingTable");
  table.innerHTML = "";

  filtered.forEach(b => {
    table.innerHTML += `
      <tr>
        <td>${b.name}</td>
        <td>${b.phone}</td>
        <td>${b.pickup}</td>
        <td>${b.dropoff}</td>
        <td>${b.fare}</td>
        <td>${b.status}</td>
        <td>${b.driver}</td>
        <td></td>
      </tr>
    `;
  });
}

function updateDriverPanels() {
  driversDiv = document.getElementById("drivers");
  availableDiv = document.getElementById("availableDrivers");
  onJobDiv = document.getElementById("onJobDrivers");

  driversDiv.innerHTML = drivers.length;
  availableDiv.innerHTML = drivers.filter(d => d.status === "Available").length;
  onJobDiv.innerHTML = drivers.filter(d => d.status === "On Job").length;
}

display();
