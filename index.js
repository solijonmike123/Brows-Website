document.addEventListener("DOMContentLoaded", () => {
  const year = document.getElementById("year");

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  const dateInput = document.querySelector('input[name="date"]');
  const timeSelect = document.getElementById("timeSelect");
  const availabilityMessage = document.getElementById("availabilityMessage");
  const confirmationMessage = document.getElementById("confirmationMessage");
  const form = document.querySelector(".booking-form");

  if (!dateInput || !timeSelect || !availabilityMessage || !form) {
    return;
  }

  const storageKey = "lashesBookingSlots";
  const availableTimes = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
  const today = new Date().toISOString().split("T")[0];
  dateInput.min = today;

  function getBookedSlots() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
      if (Array.isArray(saved) && saved.length) {
        return saved;
      }
    } catch (error) {
      console.warn("Could not read booked slots", error);
    }

    return [{ date: today, time: "14:00" }];
  }

  function saveBookedSlots(slots) {
    localStorage.setItem(storageKey, JSON.stringify(slots));
  }

  function updateTimeOptions(selectedDate) {
    timeSelect.innerHTML = "";

    if (!selectedDate) {
      const placeholder = document.createElement("option");
      placeholder.value = "";
      placeholder.textContent = "Choose a date first";
      timeSelect.appendChild(placeholder);
      availabilityMessage.textContent = "Select a date to see available times.";
      availabilityMessage.className = "availability-message";
      return;
    }

    const bookedSlots = getBookedSlots();
    const bookedTimes = bookedSlots
      .filter((slot) => slot.date === selectedDate)
      .map((slot) => slot.time);

    const available = availableTimes.filter((time) => !bookedTimes.includes(time));

    if (!available.length) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "No available times for this date";
      timeSelect.appendChild(option);
      availabilityMessage.textContent = "No available times are left on that date. Please choose another day.";
      availabilityMessage.className = "availability-message error";
      return;
    }

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Choose a time";
    timeSelect.appendChild(placeholder);

    available.forEach((time) => {
      const option = document.createElement("option");
      option.value = time;
      option.textContent = time;
      timeSelect.appendChild(option);
    });

    availabilityMessage.textContent = `Available times for ${selectedDate}: ${available.join(", ")}`;
    availabilityMessage.className = "availability-message";
  }

  dateInput.addEventListener("change", () => updateTimeOptions(dateInput.value));

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const selectedDate = dateInput.value;
    const selectedTime = timeSelect.value;

    if (!selectedDate || !selectedTime) {
      availabilityMessage.textContent = "Please choose both a date and a time.";
      availabilityMessage.className = "availability-message error";
      return;
    }

    const bookedSlots = getBookedSlots();
    const isBooked = bookedSlots.some((slot) => slot.date === selectedDate && slot.time === selectedTime);

    if (isBooked) {
      availabilityMessage.textContent = "That time has already been booked. Please choose another option.";
      availabilityMessage.className = "availability-message error";
      return;
    }

    const formData = new FormData(form);
    const name = formData.get("name") || "";
    const email = formData.get("email") || "";
    const phone = formData.get("phone") || "";
    const service = formData.get("service") || "";
    const homeService = formData.get("home_service") || "";
    const details = formData.get("details") || "";

    const subjectValue = `New booking request: ${service}`;
    const hiddenSubject = form.querySelector('input[name="_subject"]');

    if (hiddenSubject) {
      hiddenSubject.value = subjectValue;
    } else {
      const subjectInput = document.createElement("input");
      subjectInput.type = "hidden";
      subjectInput.name = "_subject";
      subjectInput.value = subjectValue;
      form.appendChild(subjectInput);
    }

    const dateInputField = form.querySelector('input[name="date"]');
    const timeSelectField = form.querySelector('select[name="time"]');

    if (dateInputField) {
      dateInputField.name = "date";
    }

    if (timeSelectField) {
      timeSelectField.name = "time";
    }

    const updatedSlots = [...bookedSlots, { date: selectedDate, time: selectedTime }];
    saveBookedSlots(updatedSlots);

    availabilityMessage.textContent = `Thanks! Your booking request for ${selectedDate} at ${selectedTime} is being submitted.`;
    availabilityMessage.className = "availability-message success";

    if (confirmationMessage) {
      confirmationMessage.hidden = false;
    }

    form.submit();
  });

  updateTimeOptions(dateInput.value);
});
