let bookings = JSON.parse(localStorage.getItem("bookings")) || [];

let tariff = JSON.parse(localStorage.getItem("tariff")) || {
  baseFare: 5,
  rate1: 3,
  rate2: 2.5,
  rate3: 2,
  nightRate: 1.3
};

let drivers = [
  { name: "Driver 1", status: "Available" },
  { name: "Driver 2", status: "Available" },
  { name: "Driver 3", status: "On Job" }
];

function saveAll() {
  localStorage.setItem("bookings", JSON.stringify(bookings));
  localStorage.setItem("tariff", JSON.stringify(tariff));
}

/* ---------------- BOOKING ---------------- */

function openBooking() {
  bookingModal.style.display = "block";
  loadDrivers();
}

function closeBooking() {
  bookingModal.style.display = "none";
}

function loadDrivers() {
  driverSelect.innerHTML = "";
  drivers.forEach(d => {
    driverSelect.innerHTML += `<option>${d.name}</option>`;
  });
}

/* ---------------- TARIFF ---------------- */

function openTariff() {
  tariffModal.style.display = "block";

  baseFare.value = tariff.baseFare;
  rate1.value = tariff.rate1;
  rate2.value = tariff.rate2;
  rate3.value = tariff.rate3;
  nightRate.value = tariff.nightRate;
}

function closeTariff() {
  tariffModal.style.display = "none";
}

function saveTariff() {
  tariff.baseFare = parseFloat(baseFare.value);
  tariff.rate1 = parseFloat(rate1.value);
  tariff.rate2 = parseFloat(rate2.value);
  tariff.rate3 = parseFloat(rate3.value);
  tariff.nightRate = parseFloat(nightRate.value);

  saveAll();
  alert("Tariff Saved");
}

/* ---------------- FARE ---------------- */

async function calculateFare() {

  let pickup = document.getElementById("pickup").value;
  let dropoff = document.getElementById("dropoff").value;

  let pRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${pickup}`);
  let dRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${dropoff}`);

  let p = (await pRes.json())[0];
  let d = (await dRes.json())[0];

  let routeRes = await fetch(
    `https://router.project-osrm.org/route/v1/driving/${p.lon},${p.lat};${d.lon},${d.lat}?overview=false`
  );

  let route = await routeRes.json();
  let miles = route.routes[0].distance / 1609;

  let fare = calculateTariff(miles);

  document.getElementById("fare").value =
    `£${fare.toFixed(2)} (${miles.toFixed(2)} miles)`;
}

function calculateTariff(distance) {

  let fare = tariff.baseFare;

  if (distance <= 1) {
    fare += distance * tariff.rate1;
  } else if (distance <= 3) {
    fare += (1 * tariff.rate1) + ((distance - 1) * tariff.rate2);
  } else {
    fare += (1 * tariff.rate1) + (2 * tariff.rate2) + ((distance - 3) * tariff.rate3);
  }

  let hour = new Date().getHours();
  if (hour >= 22 || hour < 6) {
    fare *= tariff.nightRate;
  }

  return fare;
}

/* ---------------- BOOKINGS ---------------- */

function addBooking() {
  bookings.push({
    id: Date.now(),
    name: name.value,
    phone: phone.value,
    pickup: pickup.value,
    dropoff: dropoff.value,
    fare: fare.value,
    driver: driverSelect.value,
    status: "Pending"
  });

  saveAll();
  display();
  closeBooking();
}

function display() {
  bookingTable.innerHTML = "";

  bookings.forEach(b => {
    bookingTable.innerHTML += `
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

  updateDrivers();
}

function dispatch(id) {
  let b = bookings.find(x => x.id === id);
  b.status = "Dispatched";
  saveAll();
  display();
}

function complete(id) {
  let b = bookings.find(x => x.id === id);
  b.status = "Completed";
  saveAll();
  display();
}

function remove(id) {
  bookings = bookings.filter(x => x.id !== id);
  saveAll();
  display();
}

/* ---------------- SEARCH ---------------- */

function searchCustomer() {
  let val = searchPhone.value;

  let filtered = bookings.filter(b => b.phone.includes(val));

  bookingTable.innerHTML = "";
  filtered.forEach(b => {
    bookingTable.innerHTML += `
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

/* ---------------- DRIVER PANEL ---------------- */

function updateDrivers() {
  drivers.innerHTML = drivers.length;
  availableDrivers.innerHTML = drivers.filter(d => d.status === "Available").length;
  onJobDrivers.innerHTML = drivers.filter(d => d.status === "On Job").length;
}

display();
