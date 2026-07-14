// ==================== Grouped-digit formatting ====================
function formatGroupedDigits(rawValue, groupLengths) {
    const digits = rawValue.replace(/\D/g, "").slice(
        0,
        groupLengths.reduce((sum, n) => sum + n, 0)
    );
    let out = "";
    let index = 0;
    groupLengths.forEach((len) => {
        const part = digits.slice(index, index + len);
        if (part.length === 0) return;
        out += (out.length > 0 ? "-" : "") + part;
        index += len;
    });
    return out;
}
function attachGroupedDigitFormatting(inputId, groupLengths) {
    const input = document.getElementById(inputId);
    input.addEventListener("input", () => {
        input.value = formatGroupedDigits(input.value, groupLengths);
    });
}

const ownerID = document.getElementById("ownerID");

ownerID.addEventListener("input", function () {
    
    let value = this.value.replace(/\D/g, "").substring(0, 13);

  
    let formatted = "";

    if (value.length > 0) formatted += value.substring(0, 1);
    if (value.length > 1) formatted += "-" + value.substring(1, 5);
    if (value.length > 5) formatted += "-" + value.substring(5, 10);
    if (value.length > 10) formatted += "-" + value.substring(10, 12);
    if (value.length > 12) formatted += "-" + value.substring(12, 13);

    this.value = formatted;
});

attachGroupedDigitFormatting("shopPhone", [3, 3, 4]);// 000-000-0000
attachGroupedDigitFormatting("ownerPhone", [3, 3, 4]); 

// ==================== Date of birth dropdowns ====================
const dobDay = document.getElementById("dobDay");
for (let day = 1; day <= 31; day++) {
    const option = document.createElement("option");
    option.value = String(day);
    option.textContent = String(day);
    dobDay.appendChild(option);
}
const dobMonth = document.getElementById("dobMonth");
const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];
monthNames.forEach((name, i) => {
    const option = document.createElement("option");
    option.value = String(i + 1);
    option.textContent = name;
    dobMonth.appendChild(option);
});
const dobYear = document.getElementById("dobYear");
const currentYear = new Date().getFullYear();
for (let year = currentYear - 18; year >= currentYear - 80; year--) {
    const option = document.createElement("option");
    option.value = String(year);
    option.textContent = String(year);
    dobYear.appendChild(option);
}
// ==================== Switch (Halal certified) ====================
// JS-driven toggle
const halalSwitch = document.getElementById("halal-switch");
const halalThumb = document.getElementById("halal-switch-thumb");
const halalInput = document.getElementById("halalCertifiedInput");
halalSwitch.addEventListener("click", () => {
    const isOn = halalSwitch.getAttribute("aria-checked") === "true";
    halalSwitch.setAttribute("aria-checked", String(!isOn));
    halalSwitch.classList.toggle("bg-green-500", !isOn);
    halalSwitch.classList.toggle("bg-gray-300", isOn);
    halalThumb.classList.toggle("translate-x-5", !isOn);
    halalThumb.classList.toggle("translate-x-1", isOn);
    // Keep the real (hidden) checkbox in sync, so "halalCertified"
    // actually appears in the form's submitted data.
    halalInput.checked = !isOn;
});

const veganSwitch = document.getElementById("vegan-switch");
const veganThumb = document.getElementById("vegan-switch-thumb");
const veganInput = document.getElementById("veganCertifiedInput");

veganSwitch.addEventListener("click", () => {
    const checked = veganInput.checked;

    veganInput.checked = !checked;
    veganSwitch.setAttribute("aria-checked", !checked);

    if (!checked) {
        veganSwitch.classList.remove("bg-gray-300");
        veganSwitch.classList.add("bg-green-600");
        veganThumb.classList.remove("translate-x-1");
        veganThumb.classList.add("translate-x-6");
    } else {
        veganSwitch.classList.remove("bg-green-600");
        veganSwitch.classList.add("bg-gray-300");
        veganThumb.classList.remove("translate-x-6");
        veganThumb.classList.add("translate-x-1");
    }
});

// ==================== Form submit -> Dialog/Modal ====================
// Clicking "Submit Application"
const vendorForm = document.getElementById("vendor-form");
const confirmBackdrop = document.getElementById("confirm-backdrop");
const confirmDialog = document.getElementById("confirm-dialog");
const confirmActions = document.getElementById("confirm-dialog-actions");
const confirmSpinner = document.getElementById("confirm-spinner");
const confirmProgressWrap = document.getElementById("confirm-progress-wrap");
const confirmProgressBar = document.getElementById("confirm-progress-bar");
const confirmProgressPercent = document.getElementById("confirm-progress-percent");
const confirmCancel = document.getElementById("confirm-cancel");
const confirmSubmit = document.getElementById("confirm-submit");

function openConfirmDialog() {
    confirmBackdrop.classList.remove("opacity-0", "pointer-events-none");
    confirmDialog.classList.remove("opacity-0", "pointer-events-none");
    confirmSubmit.focus();
}
function closeConfirmDialog() {
    confirmBackdrop.classList.add("opacity-0", "pointer-events-none");
    confirmDialog.classList.add("opacity-0", "pointer-events-none");
    confirmActions.classList.remove("hidden");
    confirmSpinner.classList.add("hidden");
    confirmSpinner.classList.remove("flex");
    confirmProgressWrap.classList.add("hidden");
    confirmProgressBar.style.width = "0%";
    confirmProgressPercent.textContent = "0%";
}
vendorForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!vendorForm.checkValidity()) {
        vendorForm.reportValidity();
        return;
    }
    openConfirmDialog();
});


confirmCancel.addEventListener("click", closeConfirmDialog);
confirmBackdrop.addEventListener("click", closeConfirmDialog);
confirmSubmit.addEventListener("click", () => {
    // Step 1: Spinner — indeterminate, short. Swap the action
    confirmActions.classList.add("hidden");
    confirmSpinner.classList.remove("hidden");
    confirmSpinner.classList.add("flex");
    setTimeout(() => {
        // Step 2: Progress Bar — determinate, longer.
        confirmSpinner.classList.add("hidden");
        confirmSpinner.classList.remove("flex");
        confirmProgressWrap.classList.remove("hidden");
        let percent = 0;
        const progressInterval = setInterval(() => {
            percent += 10;
            confirmProgressBar.style.width = percent + "%";
            confirmProgressPercent.textContent = percent + "%";
            if (percent >= 100) {
                clearInterval(progressInterval);
                setTimeout(finishSubmission, 300);
            }
        }, 220); // ~10 steps x 220ms ≈ 2.2s total — comfortably over the ">2 seconds" threshold
    }, 800); // ~800ms of indeterminate "preparing" before we have real progress to show
});


function finishSubmission() {
    closeConfirmDialog();
    vendorForm.reset();
    // reset() unchecks the hidden checkbox but doesn't touch the
    // visual switch button — sync it back to "off" manually.
    halalSwitch.setAttribute("aria-checked", "false");
    halalSwitch.classList.add("bg-gray-300");
    halalSwitch.classList.remove("bg-gray-500");
    halalThumb.classList.add("translate-x-1");
    halalThumb.classList.remove("translate-x-5");
    showToast("Application submitted successfully!");
}
// Escape closes the confirm dialog too, same convention as the drawer
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !confirmDialog.classList.contains("opacity-0")) {
        closeConfirmDialog();
    }
});

// ==================== Snackbar/Toast ====================
const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toast-message");
const toastClose = document.getElementById("toast-close");
let toastTimeoutId = null;
function showToast(message) {
    toastMessage.textContent = message;
    toast.classList.remove("opacity-0", "translate-y-4", "pointer-events-none");
    // Low-priority means it doesn't wait for the user — it leaves
    // on its own after a few seconds, unlike the Dialog which
    // waited for an explicit choice.
    clearTimeout(toastTimeoutId);
    toastTimeoutId = setTimeout(hideToast, 4000);
}
function hideToast() {
    toast.classList.add("opacity-0", "translate-y-4", "pointer-events-none");
}
toastClose.addEventListener("click", () => {
    clearTimeout(toastTimeoutId);
    hideToast();
});