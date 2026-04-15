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
  { name: "Driver 3", status: "Available" }
];

function saveAll() {
  localStorage.setItem("bookings", JSON.stringify(bookings));
  localStorage.setItem("tariff", JSON.stringify(tariff));
}

/* BOOKING */

function openBooking() {
  bookingModal.style.display = "block";
  driverSelect.innerHTML = drivers.map(d => `<option>${d.name}</option>`).join("");
}

function closeBooking() {
  bookingModal.style.display = "none";
}

/* TARIFF */

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
  tariff.baseFare = +baseFare.value;
  tariff.rate1 = +rate1.value;
  tariff.rate2 = +rate2.value;
  tariff.rate3 = +rate3.value;
  tariff.nightRate = +nightRate.value;

  saveAll();
  alert("Tariff saved");
}

/* FARE */

async function calculateFare() {

  let pickup = pickup.value;
  let dropoff = dropoff.value;

  let p = (await (await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${pickup}`)).json())[0];
  let d = (await (await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${dropoff}`)).json())[0];

  let route = await (await fetch(
    `https://router.project-osrm.org/route/v1/driving/${p.lon},${p.lat};${d.lon},${d.lat}?overview=false`
  )).json();

  let miles = route.routes[0].distance / 1609;

  let fare = calculateTariff(miles);

  document.getElementById("fare").value = `£${fare.toFixed(2)} (${miles.toFixed(2)} mi)`;
}

function calculateTariff(distance) {
  let fare = tariff.baseFare;

  if (distance <= 1) {
    fare += distance * tariff.rate1;
  } else if (distance <= 3) {
    fare += tariff.rate1 + (distance - 1) * tariff.rate2;
  } else {
    fare += tariff.rate1 + 2 * tariff.rate2 + (distance - 3) * tariff.rate3;
  }

  let hour = new Date().getHours();
  if (hour >= 22 || hour < 6) {
    fare *= tariff.nightRate;
  }

  return fare;
}

/* BOOKINGS */

function addBooking() {
  bookings.push({
    id: Date.now(),
    name: name.value,
    phone: phone.value,
    pickup: pickup.value,
    dropoff: dropoff.value,
    fare: fare.value,
    driver: driverSelect.value,
    date: date.value,
    status: "Pending"
  });

  saveAll();
  display();
  closeBooking();
}

function display(filter = "all") {
  bookingTable.innerHTML = "";

  let today = new Date().toISOString().split("T")[0];

  bookings.filter(b => {
    if (filter === "today") return b.date === today;
    if (filter === "future") return b.date > today;
    if (filter === "completed") return b.status === "Completed";
    return true;
  }).forEach(b => {
    bookingTable.innerHTML += `
      <tr>
        <td>${b.name}</td>
        <td>${b.phone}</td>
        <td>${b.pickup}</td>
        <td>${b.dropoff}</td>
        <td>${b.fare}</td>
        <td>${b.status}</td>
        <td>${b.driver}</td>
        <td>${b.date}</td>
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

function filterJobs(type) {
  display(type);
}

function dispatch(id) {
  let b = bookings.find(x => x.id === id);
  b.status = "Dispatched";

  let driver = drivers.find(d => d.name === b.driver);
  if (driver) driver.status = "On Job";

  saveAll();
  display();
}

function complete(id) {
  let b = bookings.find(x => x.id === id);
  b.status = "Completed";

  let driver = drivers.find(d => d.name === b.driver);
  if (driver) driver.status = "Available";

  saveAll();
  display();
}

function remove(id) {
  bookings = bookings.filter(x => x.id !== id);
  saveAll();
  display();
}

/* SEARCH */

function searchCustomer() {
  let val = searchPhone.value;
  let filtered = bookings.filter(b => b.phone.includes(val));

  bookingTable.innerHTML = filtered.map(b => `
    <tr>
      <td>${b.name}</td>
      <td>${b.phone}</td>
      <td>${b.pickup}</td>
      <td>${b.dropoff}</td>
      <td>${b.fare}</td>
      <td>${b.status}</td>
      <td>${b.driver}</td>
      <td>${b.date}</td>
      <td></td>
    </tr>
  `).join("");
}

/* DRIVER PANEL */

function updateDrivers() {
  driversCount.innerHTML = drivers.length;
  availableCount.innerHTML = drivers.filter(d => d.status === "Available").length;
  onJobCount.innerHTML = drivers.filter(d => d.status === "On Job").length;
}

display();
