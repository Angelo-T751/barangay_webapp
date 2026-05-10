document.addEventListener('DOMContentLoaded', () => {
    let selectedStatus = null;
    let currentAppId = null;

    // --- CONNECTION: Load Global Statuses ---
    let appStatuses = JSON.parse(localStorage.getItem('appStatuses')) || {};

    // 1. LOAD SAVED DATA COUNTS
    let pendingCount = parseInt(localStorage.getItem('pendingCount')) || 3;
    let approvedCount = parseInt(localStorage.getItem('approvedCount')) || 0;
    let rejectedCount = parseInt(localStorage.getItem('rejectedCount')) || 0;
    
    let processedIds = JSON.parse(localStorage.getItem('processedIds')) || [];

    // --- FIX: ITAGO (HIDE) ANG ROW KUNG NA-PROCESS NA ---
    const allRows = document.querySelectorAll('[id^="row-"]');
    
    allRows.forEach(row => {
        const id = row.id.replace('row-', ''); 
        let stat = appStatuses[id]; 
        
        // Kung Approved, Rejected, o nasa processed list, itago yung row sa Dashboard
        if ((stat && stat !== 'Pending') || processedIds.includes(id)) {
            row.style.display = 'none';
        }
    });

    window.openLogoutModal = function(event) {
        event.preventDefault();
        document.getElementById('logoutModalOverlay').style.display = 'flex';
        document.getElementById('contentBlur').classList.add('blurred');
    }

    window.closeLogoutModal = function() {
        document.getElementById('logoutModalOverlay').style.display = 'none';
        document.getElementById('contentBlur').classList.remove('blurred');
    }

    const ctx = document.getElementById('pieChart').getContext('2d');
    const pieChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [pendingCount, approvedCount, rejectedCount], 
                backgroundColor: ['#FCF00B', '#5EFE60', '#FF4F4F'],
                borderWidth: 0, cutout: '80%'
            }]
        },
        options: { 
            responsive: true, maintainAspectRatio: false, 
            plugins: { legend: { display: false } } 
        }
    });

    window.updateStatsUI = function() {
        if(document.getElementById('stat-pending')) document.getElementById('stat-pending').innerText = pendingCount;
        if(document.getElementById('stat-approved')) document.getElementById('stat-approved').innerText = approvedCount;
        if(document.getElementById('stat-rejected')) document.getElementById('stat-rejected').innerText = rejectedCount;
        if(document.getElementById('totalNum')) document.getElementById('totalNum').innerText = pendingCount + approvedCount + rejectedCount;
        
        pieChart.data.datasets[0].data = [pendingCount, approvedCount, rejectedCount];
        pieChart.update();

        localStorage.setItem('pendingCount', pendingCount);
        localStorage.setItem('approvedCount', approvedCount);
        localStorage.setItem('rejectedCount', rejectedCount);
    }

    window.openModal = function(id, name, type) {
        currentAppId = id;
        selectedStatus = null;
        
        document.getElementById('modalForm').style.display = 'block';
        document.getElementById('modalSuccess').style.display = 'none';
        document.getElementById('errorMessage').style.display = 'none';
        
        const modalCard = document.getElementById('modalCard');
        if(modalCard) modalCard.classList.remove('shake-error', 'error-stroke');

        document.getElementById('m-id').value = id;
        document.getElementById('m-name').value = name;
        document.getElementById('m-type').value = type;
        document.getElementById('adminNote').value = "";
        document.getElementById('selectionMsg').innerText = "";
        document.getElementById('modal-status-text').innerText = "Pending";
        document.getElementById('modal-status-text').className = "status-display pending";
        
        document.getElementById('fileInput').value = ""; 
        if(document.getElementById('fileNameDisplay')) document.getElementById('fileNameDisplay').innerText = "UPLOAD FILE";
        document.getElementById('filePreview').style.display = 'none';
        document.getElementById('plusBtn').style.display = 'block';
        document.getElementById('uploadBox').style.display = 'none';
        
        document.getElementById('modalOverlay').style.display = 'flex';
        document.getElementById('contentBlur').classList.add('blurred');
    }

    window.closeModal = function() {
        document.getElementById('modalOverlay').style.display = 'none';
        document.getElementById('contentBlur').classList.remove('blurred');
    }

    window.selectStatus = function(choice) {
        selectedStatus = choice;
        const msg = document.getElementById('selectionMsg');
        const statusDisplay = document.getElementById('modal-status-text');
        
        document.getElementById('errorMessage').style.display = 'none';
        const modalCard = document.getElementById('modalCard');
        if(modalCard) modalCard.classList.remove('shake-error', 'error-stroke');

        msg.innerText = "Action: " + choice.toUpperCase();
        msg.style.color = (choice === 'Approved') ? '#065F46' : '#FF4F4F';
        statusDisplay.innerText = choice;
        statusDisplay.className = 'status-display ' + choice.toLowerCase();
        document.getElementById('uploadBox').style.display = (choice === 'Approved') ? 'flex' : 'none';
    }

    window.handleFileSelect = function() {
        const fileInput = document.getElementById('fileInput');
        const file = fileInput.files[0];
        
        if (file) {
            if(document.getElementById('fileNameDisplay')) document.getElementById('fileNameDisplay').innerText = file.name;
            document.getElementById('filePreview').style.display = 'flex';
            document.getElementById('plusBtn').style.display = 'none';
            
            document.getElementById('errorMessage').style.display = 'none';
            const modalCard = document.getElementById('modalCard');
            if(modalCard) modalCard.classList.remove('shake-error', 'error-stroke');
        } else {
            if(document.getElementById('fileNameDisplay')) document.getElementById('fileNameDisplay').innerText = "UPLOAD FILE";
            document.getElementById('filePreview').style.display = 'none';
            document.getElementById('plusBtn').style.display = 'block';
        }
    }

    window.validateAndUpdate = function() {
        const note = document.getElementById('adminNote').value.trim();
        const file = document.getElementById('fileInput').files[0];
        
        let isValid = false;
        let errorMsg = "";

        if (!selectedStatus) {
            errorMsg = "Please select a status (APPROVE/REJECT).";
        } else if (note === "") {
            errorMsg = "Admin note is required.";
        } else if (selectedStatus === 'Approved' && !file) {
            errorMsg = "Please attach the certificate file before approving.";
        } else {
            isValid = true;
        }
        
        if (isValid) {
            document.getElementById('errorMessage').style.display = 'none';
            const modalCard = document.getElementById('modalCard');
            if(modalCard) modalCard.classList.remove('shake-error', 'error-stroke');

            // --- SAVE GLOBALLY ---
            appStatuses[currentAppId] = selectedStatus;
            localStorage.setItem('appStatuses', JSON.stringify(appStatuses));

            const row = document.getElementById('row-' + currentAppId);
            if (row) {
                // --- FIX: TANGGALIN NA YUNG ROW SA DASHBOARD ---
                row.remove();
                
                if (!processedIds.includes(currentAppId)) {
                    processedIds.push(currentAppId);
                    localStorage.setItem('processedIds', JSON.stringify(processedIds));
                }
            }
            
            pendingCount = Math.max(0, pendingCount - 1);
            if (selectedStatus === 'Approved') approvedCount++;
            else if (selectedStatus === 'Rejected') rejectedCount++;
            
            window.updateStatsUI();
            
            document.getElementById('modalForm').style.display = 'none';
            document.getElementById('modalSuccess').style.display = 'block';
        } else {
            const errElement = document.getElementById('errorMessage');
            errElement.innerText = errorMsg; 
            errElement.style.display = 'block';
            
            const card = document.getElementById('modalCard');
            if(card) {
                card.classList.add('shake-error', 'error-stroke');
                setTimeout(() => card.classList.remove('shake-error'), 400);
            }
        }
    }

    // Trigger UI Update upon load
    window.updateStatsUI();
});