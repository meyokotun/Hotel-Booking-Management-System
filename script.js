// GAS Web App URL ကို ဒီမှာထည့်ပါ
const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbzHQXqdMtanVdGdn3AuaE3gko5mycdK584HugUuUGc1pMOBqFqZhzgNRKKrg4tloS1JVQ/exec';

// DOM Elements
const roomsSection = document.getElementById('roomsSection');
const bookingFormSection = document.getElementById('bookingFormSection');
const showRoomsBtn = document.getElementById('showRoomsBtn');
const showBookingFormBtn = document.getElementById('showBookingFormBtn');
const searchRoomsBtn = document.getElementById('searchRoomsBtn');
const checkInDateInput = document.getElementById('checkInDate');
const checkOutDateInput = document.getElementById('checkOutDate');
const roomListDiv = document.getElementById('roomList');
const bookingForm = document.getElementById('bookingForm');
const selectedRoomIdInput = document.getElementById('selectedRoomId');
const selectedRoomPriceInput = document.getElementById('selectedRoomPrice');
const guestNameInput = document.getElementById('guestName');
const guestPhoneInput = document.getElementById('guestPhone');
const guestEmailInput = document.getElementById('guestEmail');
const displaySelectedRoom = document.getElementById('displaySelectedRoom');
const displayDates = document.getElementById('displayDates');
const displayTotalPrice = document.getElementById('displayTotalPrice');
const loadingOverlay = document.getElementById('loading');
const messageBox = document.getElementById('message');

let selectedRoom = null;
let checkInDate = null;
let checkOutDate = null;

// Utility functions to show/hide sections, loading, messages
function showSection(section) {
    roomsSection.classList.add('hidden');
    bookingFormSection.classList.add('hidden');
    section.classList.remove('hidden');
}

function setActiveNavButton(button) {
    showRoomsBtn.classList.remove('active');
    showBookingFormBtn.classList.remove('active');
    button.classList.add('active');
}

function showLoading() {
    loadingOverlay.classList.remove('hidden');
}

function hideLoading() {
    loadingOverlay.classList.add('hidden');
}

function showMessage(msg, type = 'info') {
    messageBox.textContent = msg;
    messageBox.className = `message-box show ${type}`; // Reset classes and add new ones
    setTimeout(() => {
        messageBox.classList.remove('show');
    }, 3000);
}

// --- Core Functions ---

async function fetchRooms() {
    showLoading();
    try {
        const response = await fetch(`${GAS_WEB_APP_URL}?action=getRooms`);
        const data = await response.json();
        if (data.rooms) {
            displayRooms(data.rooms);
        } else {
            showMessage('အခန်းစာရင်းများ ဆွဲယူ၍မရပါ', 'error');
        }
    } catch (error) {
        console.error('Error fetching rooms:', error);
        showMessage('အခန်းစာရင်းများ ဆွဲယူရာတွင် အမှားဖြစ်ခဲ့သည်', 'error');
    } finally {
        hideLoading();
    }
}

async function searchAvailableRooms() {
    checkInDate = checkInDateInput.value;
    checkOutDate = checkOutDateInput.value;

    if (!checkInDate || !checkOutDate) {
        showMessage('ဝင်ရောက်မည့်နေ့နှင့် ထွက်ခွာမည့်နေ့ ရွေးချယ်ပေးပါ', 'info');
        return;
    }
    if (new Date(checkInDate) >= new Date(checkOutDate)) {
        showMessage('ထွက်ခွာမည့်နေ့သည် ဝင်ရောက်မည့်နေ့ထက် နောက်ကျရပါမည်', 'info');
        return;
    }

    showLoading();
    try {
        const response = await fetch(`${GAS_WEB_APP_URL}?action=getAvailableRooms&checkInDate=${checkInDate}&checkOutDate=${checkOutDate}`);
        const data = await response.json();
        if (data.availableRooms) {
            displayRooms(data.availableRooms);
            if (data.availableRooms.length === 0) {
                showMessage('ဤရက်စွဲများတွင် ရနိုင်သောအခန်းမရှိပါ', 'info');
            } else {
                showMessage('ရနိုင်သောအခန်းများ ရှာဖွေတွေ့ရှိပါပြီ', 'success');
            }
        } else {
            showMessage('ရနိုင်သောအခန်းများ ရှာဖွေ၍မရပါ', 'error');
        }
    } catch (error) {
        console.error('Error searching available rooms:', error);
        showMessage('ရနိုင်သောအခန်းများ ရှာဖွေရာတွင် အမှားဖြစ်ခဲ့သည်', 'error');
    } finally {
        hideLoading();
    }
}

function displayRooms(rooms) {
    roomListDiv.innerHTML = '';
    if (rooms.length === 0) {
        roomListDiv.innerHTML = '<p>ဖော်ပြရန် အခန်းမရှိပါ</p>';
        return;
    }

    rooms.forEach(room => {
        const roomCard = document.createElement('div');
        roomCard.className = 'room-card';
        roomCard.innerHTML = `
            <img src="${room.ImageUrl || 'https://via.placeholder.com/300x180?text=No+Image'}" alt="${room.RoomType}">
            <div class="room-info">
                <h3>${room.RoomType}</h3>
                <p><i class="fas fa-money-bill-wave"></i> ဈေးနှုန်း: ${room.PricePerNight} Ks / ည</p>
                <p><i class="fas fa-users"></i> လူဦးရေ: ${room.Capacity} ဦး</p>
                <p><i class="fas fa-info-circle"></i> ${room.Description}</p>
            </div>
            <div class="room-actions">
                <button class="book-btn" data-room-id="${room.RoomID}" data-room-type="${room.RoomType}" data-room-price="${room.PricePerNight}">
                    <i class="fas fa-book"></i> ဘွတ်ကင်လုပ်မည်
                </button>
            </div>
        `;
        roomListDiv.appendChild(roomCard);
    });

    // Add event listeners to "ဘွတ်ကင်လုပ်မည်" buttons
    document.querySelectorAll('.book-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const roomId = event.currentTarget.dataset.roomId;
            const roomType = event.currentTarget.dataset.roomType;
            const roomPrice = parseFloat(event.currentTarget.dataset.roomPrice);

            if (!checkInDate || !checkOutDate || new Date(checkInDate) >= new Date(checkOutDate)) {
                showMessage('အခန်းဘွတ်ကင်မလုပ်မီ ဝင်ရောက်မည့်နေ့နှင့် ထွက်ခွာမည့်နေ့ကို ရွေးချယ်ပေးပါ', 'info');
                // Scroll to top or highlight date inputs
                checkInDateInput.focus();
                return;
            }

            selectedRoom = { id: roomId, type: roomType, price: roomPrice };
            populateBookingForm();
            showSection(bookingFormSection);
            setActiveNavButton(showBookingFormBtn);
        });
    });
}

function populateBookingForm() {
    if (selectedRoom) {
        selectedRoomIdInput.value = selectedRoom.id;
        selectedRoomPriceInput.value = selectedRoom.price;
        displaySelectedRoom.textContent = `${selectedRoom.type} (ID: ${selectedRoom.id})`;

        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        const numberOfNights = Math.ceil(Math.abs(checkOut - checkIn) / (1000 * 3600 * 24));
        const totalPrice = numberOfNights * selectedRoom.price;

        displayDates.textContent = `${checkInDate} မှ ${checkOutDate} (${numberOfNights} ည)`;
        displayTotalPrice.textContent = `${totalPrice} Ks`;
    } else {
        selectedRoomIdInput.value = '';
        selectedRoomPriceInput.value = '';
        displaySelectedRoom.textContent = 'အခန်းရွေးချယ်ထားခြင်းမရှိသေးပါ';
        displayDates.textContent = '';
        displayTotalPrice.textContent = '0 Ks';
    }
}

async function submitBooking(event) {
    event.preventDefault(); // Prevent default form submission

    const guestName = guestNameInput.value.trim();
    const guestPhone = guestPhoneInput.value.trim();
    const guestEmail = guestEmailInput.value.trim();

    if (!selectedRoom || !guestName || !guestPhone || !checkInDate || !checkOutDate) {
        showMessage('ဘွတ်ကင်အချက်အလက်များကို ပြည့်စုံစွာဖြည့်စွက်ပေးပါ', 'info');
        return;
    }

    showLoading();
    try {
        const payload = {
            action: 'createBooking',
            roomID: selectedRoom.id,
            guestName: guestName,
            guestPhone: guestPhone,
            guestEmail: guestEmail,
            checkInDate: checkInDate,
            checkOutDate: checkOutDate
        };

        const response = await fetch(GAS_WEB_APP_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain' // Must be text/plain for GAS `e.postData.contents`
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.success) {
            showMessage(`ဘွတ်ကင် အောင်မြင်ပါပြီ! Booking ID: ${data.bookingId}`, 'success');
            // Reset form and go back to rooms list
            bookingForm.reset();
            selectedRoom = null;
            checkInDate = null;
            checkOutDate = null;
            populateBookingForm(); // Clear displayed info
            document.getElementById('checkInDate').value = ''; // Clear date inputs
            document.getElementById('checkOutDate').value = '';
            fetchRooms(); // Refresh room list
            showSection(roomsSection);
            setActiveNavButton(showRoomsBtn);
        } else {
            showMessage(`ဘွတ်ကင်မလုပ်နိုင်ခဲ့ပါ: ${data.message || 'အမှားတစ်ခုခုဖြစ်သည်'}`, 'error');
        }
    } catch (error) {
        console.error('Error submitting booking:', error);
        showMessage('ဘွတ်ကင်တင်ရာတွင် အမှားဖြစ်ခဲ့သည်', 'error');
    } finally {
        hideLoading();
    }
}

// --- Event Listeners ---
showRoomsBtn.addEventListener('click', () => {
    showSection(roomsSection);
    setActiveNavButton(showRoomsBtn);
    fetchRooms(); // Reload rooms when navigating back
});

showBookingFormBtn.addEventListener('click', () => {
    showSection(bookingFormSection);
    setActiveNavButton(showBookingFormBtn);
    populateBookingForm(); // Update form if room selected
});

searchRoomsBtn.addEventListener('click', searchAvailableRooms);
bookingForm.addEventListener('submit', submitBooking);

// Set today's date as min for check-in
const today = new Date();
const minDate = today.toISOString().split('T')[0];
checkInDateInput.setAttribute('min', minDate);
checkOutDateInput.setAttribute('min', minDate); // Can refine this to be min checkInDate + 1

checkInDateInput.addEventListener('change', () => {
    if (checkInDateInput.value) {
        const nextDay = new Date(checkInDateInput.value);
        nextDay.setDate(nextDay.getDate() + 1);
        checkOutDateInput.setAttribute('min', nextDay.toISOString().split('T')[0]);
        // If current checkOutDate is earlier than new min, clear it
        if (new Date(checkOutDateInput.value) < nextDay) {
            checkOutDateInput.value = '';
        }
    }
});


// Initial load
fetchRooms();