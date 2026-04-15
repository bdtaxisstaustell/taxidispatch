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
    let option = `<option value="${d.name}">${d.name}</option>`;
    select.innerHTML += option;
  });
}

function calculateFare() {
  let d = document.getElementById("distance").value;
  let fare = 5 + (d * 2); // base + per mile
  document.getElementById("fare").value = "£" + fare.toFixed(2);
}

function addBooking() {
  let booking = {
    id: Date.now(),
    name: name.value,
    phone: phone.value,
    email: email.value,
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
    table.innerHTML += `<tr>
      <td>${b.name}</td>
      <td>${b.phone}</td>
      <td>${b.pickup}</td>
      <td>${b.dropoff}</td>
      <td>${b.fare}</td>
      <td>${b.status}</td>
      <td>${b.driver}</td>
      <td></td>
    </tr>`;
  });
}

function updateDriverPanels() {
  let onboard = document.getElementById("drivers");
  let available = document.getElementById("availableDrivers");
  let onjob = document.getElementById("onJobDrivers");

  onboard.innerHTML = drivers.length;
  available.innerHTML = drivers.filter(d => d.status === "Available").length;
  onjob.innerHTML = drivers.filter(d => d.status === "On Job").length;
}

display();
