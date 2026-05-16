document.addEventListener('DOMContentLoaded', () => {
    let selectedStatus = null;
    let currentAppId = null;


    let appStatuses = JSON.parse(localStorage.getItem('appStatuses')) || {};


    let pendingCount = parseInt(localStorage.getItem('pendingCount')) || 3;
    let approvedCount = parseInt(localStorage.getItem('approvedCount')) || 0;
    let rejectedCount = parseInt(localStorage.getItem('rejectedCount')) || 0;
    
    let processedIds = JSON.parse(localStorage.getItem('processedIds')) || [];


    const allRows = document.querySelectorAll('[id^="row-"]');
    
    allRows.forEach(row => {
        const id = row.id.replace('row-', ''); 
        let stat = appStatuses[id]; 
        

        if ((stat && stat !== 'Pending') || processedIds.includes(id)) {
            row.style.display = 'none';
        }
    });


    window.checkRecentApplicants = function() {
        const container = document.getElementById('applicantsContainer');
        const emptyMsg = document.getElementById('noApplicantsMsg');
        if (!container || !emptyMsg) return;

        const rows = container.querySelectorAll('.applicant-row');
        let hasVisibleRows = false;
        

        rows.forEach(row => {
            if (row.style.display !== 'none') {
                hasVisibleRows = true;
            }
        });


        emptyMsg.style.display = hasVisibleRows ? 'none' : 'block';
    };


    window.checkRecentApplicants();

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
    }

    window.validateAndUpdate = function() {
        const note = document.getElementById('adminNote').value.trim();
        
        let isValid = false;
        let errorMsg = "";

        if (!selectedStatus) {
            errorMsg = "Please select a status (APPROVE/REJECT).";
        } else if (note === "") {
            errorMsg = "Admin note is required.";
        } else {
            isValid = true;
        }
        
        if (isValid) {
            document.getElementById('errorMessage').style.display = 'none';
            const modalCard = document.getElementById('modalCard');
            if(modalCard) modalCard.classList.remove('shake-error', 'error-stroke');

        
            appStatuses[currentAppId] = selectedStatus;
            localStorage.setItem('appStatuses', JSON.stringify(appStatuses));

            const row = document.getElementById('row-' + currentAppId);
            if (row) {
  
                row.remove();
                
                if (!processedIds.includes(currentAppId)) {
                    processedIds.push(currentAppId);
                    localStorage.setItem('processedIds', JSON.stringify(processedIds));
                }
            }
            
            window.checkRecentApplicants();
            
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

    window.updateStatsUI();
});