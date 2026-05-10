document.addEventListener('DOMContentLoaded', () => {
    let allApplicants = JSON.parse(localStorage.getItem('allApplicants')) || [
        { id: "01", name: "Juan Dela Cruz", type: "Barangay Clearance", purpose: "Verification of requirements...", date: "05/08/26", email: "applicant@email.com", contact: "0912345678", file: "freddy.jpg" },
        { id: "02", name: "Jean Valjean", type: "Business Permit", purpose: "Verification of requirements...", date: "05/08/26", email: "applicant@email.com", contact: "0912345678", file: "freddy.jpg" },
        { id: "03", name: "Maria Clara", type: "Indigency Certificate", purpose: "Verification of requirements...", date: "05/08/26", email: "applicant@email.com", contact: "0912345678", file: "freddy.jpg" }
    ];

    // GET STATUSES OR CREATE IF NONE
    let appStatuses = JSON.parse(localStorage.getItem('appStatuses')) || {};

    const applicantList = document.getElementById('applicantList');
    const searchInput = document.getElementById('searchInput');
    let currentAppId = null;
    let selectedStatus = null;

    function renderTable(searchTerm = "") {
        applicantList.innerHTML = "";
        
        // FILTER ONLY 'APPROVED' APPLICANTS
        const filtered = allApplicants.filter(app => {
            const status = appStatuses[app.id] || "Pending";
            if (status !== "Approved") return false;
            return (app.name + app.id + app.type).toLowerCase().includes(searchTerm.toLowerCase());
        });

        if (filtered.length === 0) {
            applicantList.innerHTML = `
                <div class="no-results-msg">
                    <i class="fa-solid fa-folder-open" style="font-size: 24px; color: #cbd5e1; display: block; margin-bottom: 8px;"></i>
                    No approved applicants found!
                </div>`;
            return;
        }

        filtered.forEach(app => {
            const row = document.createElement('div');
            row.className = 'applicant-row-full';
            row.innerHTML = `
                <div>${app.id}</div>
                <div style="font-weight: 800; color: #059669;">${app.name}</div>
                <div>${app.type}</div>
                <div style="font-size: 11px; color: #64748b; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${app.purpose}</div>
                <div>${app.date}</div>
                <div class="action-cell">
                    <button class="view-btn" style="background: #D9A420;" onclick="openModal('${app.id}')"><i class="fa-solid fa-pen"></i> EDIT</button>
                </div>`;
            applicantList.appendChild(row);
        });
    }

    window.clearSearchField = () => {
        searchInput.value = "";
        renderTable();
    };

    window.openModal = (id) => {
        currentAppId = id;
        const app = allApplicants.find(a => a.id === id);
        if(!app) return;

        document.getElementById('m-id').value = app.id;
        document.getElementById('m-name').value = app.name;
        document.getElementById('m-date').value = app.date;
        document.getElementById('m-type').value = app.type;

        selectedStatus = "Approved"; // Default display
        document.getElementById('modal-status-text').innerText = "APPROVED";
        document.getElementById('modal-status-text').style.color = "#059669";
        
        document.getElementById('adminNote').value = "";
        document.getElementById('modalCard').classList.remove('error-stroke');
        document.getElementById('errorMessage').style.display = 'none';
        
        const modal = document.getElementById('modalOverlay');
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('active'), 10);
        document.getElementById('contentBlur').classList.add('blurred');
        document.getElementById('modalForm').style.display = 'block';
        document.getElementById('modalSuccess').style.display = 'none';
    };

    window.selectStatus = (status) => {
        selectedStatus = status;
        const statusText = document.getElementById('modal-status-text');
        
        document.getElementById('modalCard').classList.remove('error-stroke');
        document.getElementById('errorMessage').style.display = 'none';

        statusText.innerText = status.toUpperCase();
        if(status === 'Pending') statusText.style.color = "#D9A420";
        if(status === 'Rejected') statusText.style.color = "#dc2626";
    };

    function triggerError(message) {
        const card = document.getElementById('modalCard');
        const errorMsg = document.getElementById('errorMessage');
        
        errorMsg.innerText = message;
        errorMsg.style.display = "block";
        card.classList.add('shake', 'error-stroke');
        setTimeout(() => card.classList.remove('shake'), 400);
    }

    window.validateAndUpdate = () => {
        if(selectedStatus === "Approved") {
            triggerError("Please select a new status (Pending or Rejected)!");
            return;
        }

        const note = document.getElementById('adminNote').value.trim();
        if(note === "") {
            triggerError("Admin Note is required to change status!");
            return;
        }

        // UPDATE STATUS
        appStatuses[currentAppId] = selectedStatus;
        localStorage.setItem('appStatuses', JSON.stringify(appStatuses));

        // RECALCULATE COUNTS FOR DASHBOARD
        let pending = 0, approved = 0, rejected = 0;
        allApplicants.forEach(app => {
            let stat = appStatuses[app.id] || "Pending";
            if(stat === "Pending") pending++;
            else if(stat === "Approved") approved++;
            else if(stat === "Rejected") rejected++;
        });

        localStorage.setItem('pendingCount', pending);
        localStorage.setItem('approvedCount', approved);
        localStorage.setItem('rejectedCount', rejected);
        
        document.getElementById('modalForm').style.display = 'none';
        document.getElementById('modalSuccess').style.display = 'block';
    };

    window.closeModal = () => {
        document.getElementById('modalOverlay').classList.remove('active');
        document.getElementById('modalCard').classList.remove('error-stroke');
        document.getElementById('errorMessage').style.display = 'none';
        setTimeout(() => document.getElementById('modalOverlay').style.display = 'none', 300);
        document.getElementById('contentBlur').classList.remove('blurred');
    };

    window.openLogoutModal = () => { 
        document.getElementById('logoutModalOverlay').style.display = 'flex'; 
        document.getElementById('contentBlur').classList.add('blurred'); 
    };

    window.closeLogoutModal = () => { 
        document.getElementById('logoutModalOverlay').style.display = 'none'; 
        document.getElementById('contentBlur').classList.remove('blurred'); 
    };

    searchInput.addEventListener('input', (e) => renderTable(e.target.value));
    
    renderTable();
});