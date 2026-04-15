let bookings = JSON.parse(localStorage.getItem("bookings")) || [];

function saveData() {
  localStorage.setItem("bookings", JSON.stringify(bookings));
}

function calculateFare() {
  let distance = document.getElementById("distance").value;
  let fare = (distance * 2.5).toFixed(2); // simple rate
  document.getElementById("fare").value = "£" + fare;
}

function addBooking() {
  let booking = {
    id: Date.now(),
    name: document.getElementById("name").value,
    phone: document.getElementById("phone").value,
    email: document.getElementById("email").value,
    pickup: document.getElementById("pickup").value,
    dropoff: document.getElementById("dropoff").value,
    via: document.getElementById("via").value,
    fare: document.getElementById("fare").value,
    date: document.getElementById("date").value,
    time: document.getElementById("time").value,
    status: "Pending"
  };

  bookings.push(booking);
  saveData();
  displayBookings();
}

function displayBookings() {
  let table = document.getElementById("bookingTable");
  table.innerHTML = "";

  bookings.forEach(b => {
    let row = `
      <tr>
        <td>${b.name}</td>
        <td>${b.phone}</td>
        <td>${b.pickup}</td>
        <td>${b.dropoff}</td>
        <td>${b.fare}</td>
        <td>${b.status}</td>
        <td class="actions">
          <button onclick="dispatch(${b.id})">Dispatch</button>
          <button onclick="complete(${b.id})">Complete</button>
          <button onclick="deleteBooking(${b.id})">Delete</button>
          <button onclick="emailQuote(${b.id})">Email</button>
        </td>
      </tr>
    `;
    table.innerHTML += row;
  });
}

function deleteBooking(id) {
  bookings = bookings.filter(b => b.id !== id);
  saveData();
  displayBookings();
}

function dispatch(id) {
  let booking = bookings.find(b => b.id === id);
  booking.status = "Dispatched";
  saveData();
  displayBookings();
}

function complete(id) {
  let booking = bookings.find(b => b.id === id);
  booking.status = "Completed";
  saveData();
  displayBookings();
}

function emailQuote(id) {
  let b = bookings.find(b => b.id === id);

  let subject = `Taxi Quote for ${b.name}`;
  let body = `Pickup: ${b.pickup}
Dropoff: ${b.dropoff}
Fare: ${b.fare}`;

  window.location.href = `mailto:${b.email}?subject=${subject}&body=${body}`;
}

function searchCustomer() {
  let phone = document.getElementById("searchPhone").value;
  let results = bookings.filter(b => b.phone.includes(phone));

  let table = document.getElementById("bookingTable");
  table.innerHTML = "";

  results.forEach(b => {
    let row = `
      <tr>
        <td>${b.name}</td>
        <td>${b.phone}</td>
        <td>${b.pickup}</td>
        <td>${b.dropoff}</td>
        <td>${b.fare}</td>
        <td>${b.status}</td>
        <td></td>
      </tr>
    `;
    table.innerHTML += row;
  });
}

// Initial load
displayBookings();
