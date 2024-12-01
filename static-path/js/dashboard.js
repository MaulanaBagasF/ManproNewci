document.addEventListener("DOMContentLoaded", function() {
    const statusButtons = document.querySelectorAll(".status-btn");
    const infoButtons = document.querySelectorAll(".info-btn");
    const paymentStatusButtons = document.querySelectorAll(".payment-status-btn");
    
    // Payment Receipt Popup Elements
    const paymentReceiptOverlay = document.getElementById("paymentReceiptOverlay");
    const paymentReceiptPopup = document.getElementById("paymentReceiptPopup");
    const closeReceiptBtn = document.getElementById("closeReceiptBtn");
    
    // Receipt Detail Elements
    const receiptNamaPenyewa = document.getElementById("receiptNamaPenyewa");
    const receiptNamaMesin = document.getElementById("receiptNamaMesin");
    const receiptWaktuMulai = document.getElementById("receiptWaktuMulai");
    const receiptWaktuSelesai = document.getElementById("receiptWaktuSelesai");
    const receiptDurasi = document.getElementById("receiptDurasi");
    const receiptMerek = document.getElementById("receiptMerek");
    const receiptTotalHarga = document.getElementById("receiptTotalHarga");

    function updateTotalHargaCell(button) {
        const row = button.closest("tr");
        const status = row.querySelector(".status-btn").getAttribute("data-status");
        const statusPembayaran = row.querySelector(".payment-status-btn").getAttribute("data-statusP");
        const totalHargaCell = row.querySelector(".total-harga-cell");

        if (status === "Tersedia" && statusPembayaran === "Belum Lunas") {
            totalHargaCell.style.display = "";
        } else {
            totalHargaCell.style.display = "none";
        }
    }

    function showPaymentReceipt(row) {
        const namaPenyewa = row.querySelector(".pp").textContent.trim();
        const namaMesin = row.querySelector("td:first-child").textContent.trim();
        const merek = row.querySelector("td:nth-child(2)").textContent.trim();
        const totalHarga = row.querySelector(".total-harga-cell").textContent.trim();
        
        // Get current date and time
        const now = new Date();
        const waktuMulai = now.toLocaleString('id-ID', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        // Calculate end time (add duration)
        const durasi = row.querySelector(".total-harga-cell").textContent.match(/\((\d+) menit\)/)[1];
        now.setMinutes(now.getMinutes() + parseInt(durasi));
        const waktuSelesai = now.toLocaleString('id-ID', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        // Populate receipt details
        receiptNamaPenyewa.textContent = namaPenyewa;
        receiptNamaMesin.textContent = namaMesin;
        receiptWaktuMulai.textContent = waktuMulai;
        receiptWaktuSelesai.textContent = waktuSelesai;
        receiptDurasi.textContent = `${durasi} menit`;
        receiptMerek.textContent = merek;
        receiptTotalHarga.textContent = totalHarga.split('(')[0].trim();

        // Show popup
        paymentReceiptOverlay.style.display = "flex";
    }

    // Close popup when clicking close button or outside the popup
    closeReceiptBtn.addEventListener("click", () => {
        paymentReceiptOverlay.style.display = "none";
    });

    paymentReceiptOverlay.addEventListener("click", (event) => {
        if (event.target === paymentReceiptOverlay) {
            paymentReceiptOverlay.style.display = "none";
        }
    });

    statusButtons.forEach(button => {
        button.addEventListener("click", function() {
            const id = button.getAttribute("data-id");
            let status = button.getAttribute("data-status");

            if (status === "Digunakan") {
                status = "Tersedia";

                fetch("/update-status", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ id, status })
                }).then(response => {
                    if (response.ok) {
                        button.setAttribute("data-status", status);
                        button.textContent = status;
                        button.style.backgroundColor = "#4CAF50";
                        button.disabled = true;
                        updateTotalHargaCell(button);

                        // Re-enable buttons
                        const row = button.closest("tr");
                        row.querySelector(".info-btn").disabled = false;
                        row.querySelector(".payment-status-btn").disabled = false;
                    } else {
                        console.error("Failed to update status");
                    }
                }).catch(error => {
                    console.error("Error:", error);
                });
            }
        });
    });

    infoButtons.forEach(button => {
        button.addEventListener("click", function() {
            const idM = button.getAttribute("data-id");
            window.location.href = `/pemesan?idM=${idM}`;
        });
    });

    paymentStatusButtons.forEach(button => {
        button.addEventListener("click", function() {
            const id = button.getAttribute("data-id");
            let statusPembayaran = button.getAttribute("data-statusP");

            if (statusPembayaran === "Belum Lunas") {
                statusPembayaran = "Lunas";

                fetch("/update-payment-status", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ id, statusPembayaran })
                }).then(response => {
                    if (response.ok) {
                        button.setAttribute("data-statusP", statusPembayaran);
                        button.textContent = statusPembayaran;
                        button.style.backgroundColor = "#4CAF50";
                        updateTotalHargaCell(button);

                        // Show payment receipt popup
                        const row = button.closest("tr");
                        showPaymentReceipt(row);
                    } else {
                        console.error("Failed to update payment status");
                    }
                }).catch(error => {
                    console.error("Error:", error);
                });
            }
        });
    });

    // Initial check for all rows
    document.querySelectorAll("tr").forEach(row => {
        const statusButton = row.querySelector(".status-btn");
        if (statusButton) {
            updateTotalHargaCell(statusButton);

            // Disable buttons if status is "Digunakan"
            if (statusButton.getAttribute("data-status") === "Digunakan") {
                row.querySelector(".info-btn").disabled = true;
                row.querySelector(".payment-status-btn").disabled = true;
            }
        }
    });
});
