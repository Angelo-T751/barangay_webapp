document.addEventListener('DOMContentLoaded', () => {
    let selectedStatus = null;
    let currentAppId = null;
    let pendingCount = 3, approvedCount = 0, rejectedCount = 0;

    // --- Logout Modal Functions ---
    window.openLogoutModal = function(event) {
        event.preventDefault();
        document.getElementById('logoutModalOverlay').style.display = 'flex';
        document.getElementById('contentBlur').classList.add('blurred');
    }

    window.closeLogoutModal = function() {
        document.getElementById('logoutModalOverlay').style.display = 'none';
        document.getElementById('contentBlur').classList.remove('blurred');
    }

    // --- Initialize Chart ---
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
            responsive: true, 
            maintainAspectRatio: false, 
            plugins: { legend: { display: false } } 
        }
    });

    window.updateStatsUI = function() {
        document.getElementById('stat-pending').innerText = pendingCount;
        document.getElementById('stat-approved').innerText = approvedCount;
        document.getElementById('stat-rejected').innerText = rejectedCount;
        document.getElementById('totalNum').innerText = pendingCount + approvedCount + rejectedCount;
        pieChart.data.datasets[0].data = [pendingCount, approvedCount, rejectedCount];
        pieChart.update();
    }

    window.openModal = function(id, name, type) {
        currentAppId = id;
        selectedStatus = null;
        document.getElementById('modalForm').style.display = 'block';
        document.getElementById('modalSuccess').style.display = 'none';
        document.getElementById('errorMessage').style.display = 'none';
        document.getElementById('m-id').value = id;
        document.getElementById('m-name').value = name;
        document.getElementById('m-type').value = type;
        document.getElementById('adminNote').value = "";
        document.getElementById('selectionMsg').innerText = "";
        document.getElementById('modal-status-text').innerText = "Pending";
        document.getElementById('modal-status-text').className = "status-display pending";
        
        document.getElementById('fileInput').value = ""; 
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
        msg.innerText = "Action: " + choice.toUpperCase();
        msg.style.color = (choice === 'Approved') ? '#065F46' : '#FF4F4F';
        statusDisplay.innerText = choice;
        statusDisplay.className = 'status-display ' + choice.toLowerCase();
        document.getElementById('uploadBox').style.display = (choice === 'Approved') ? 'flex' : 'none';
    }

    window.handleFileSelect = function() {
        const file = document.getElementById('fileInput').files[0];
        if (file) {
            document.getElementById('fileNameDisplay').innerText = file.name;
            document.getElementById('filePreview').style.display = 'flex';
            document.getElementById('plusBtn').style.display = 'none';
        }
    }

    window.validateAndUpdate = function() {
        const note = document.getElementById('adminNote').value.trim();
        const file = document.getElementById('fileInput').files[0];
        let isValid = (selectedStatus === 'Approved') ? (note && file) : (selectedStatus === 'Rejected' && note);
        
        if (isValid) {
            const row = document.getElementById('row-' + currentAppId);
            if (row) row.remove();
            pendingCount--;
            if (selectedStatus === 'Approved') approvedCount++;
            else if (selectedStatus === 'Rejected') rejectedCount++;
            
            window.updateStatsUI();
            document.getElementById('modalForm').style.display = 'none';
            document.getElementById('modalSuccess').style.display = 'block';
        } else {
            document.getElementById('errorMessage').style.display = 'block';
            document.getElementById('modalCard').classList.add('shake-error');
            setTimeout(() => document.getElementById('modalCard').classList.remove('shake-error'), 400);
        }
    }
});