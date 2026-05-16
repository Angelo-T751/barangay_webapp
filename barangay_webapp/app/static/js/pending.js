document.addEventListener('DOMContentLoaded', () => {
    let allApplicants = JSON.parse(localStorage.getItem('allApplicants')) || [
        { id: "01", name: "Juan Dela Cruz", type: "Barangay Clearance", purpose: "Verification of requirements for community record.", date: "05/08/26", email: "applicant@email.com", contact: "0912345678", file: "freddy.jpg" },
        { id: "02", name: "Jean Valjean", type: "Business Permit", purpose: "Verification of requirements for community record.", date: "05/08/26", email: "applicant@email.com", contact: "0912345678", file: "freddy.jpg" },
        { id: "03", name: "Maria Clara", type: "Indigency Certificate", purpose: "Verification of requirements for community record.", date: "05/08/26", email: "applicant@email.com", contact: "0912345678", file: "freddy.jpg" }
    ];

    if (!localStorage.getItem('pendingCount')) {
        localStorage.setItem('pendingCount', allApplicants.length);
        localStorage.setItem('approvedCount', 0);
        localStorage.setItem('rejectedCount', 0);
    }

    const applicantList = document.getElementById('applicantList');
    const searchInput = document.getElementById('searchInput');
    let currentAppId = null;
    let selectedStatus = null;

    function renderTable(searchTerm = "") {
        // GINAGAMIT NA NATIN ANG appStatuses INSTEAD OF processedIds
        let appStatuses = JSON.parse(localStorage.getItem('appStatuses')) || {};
        applicantList.innerHTML = "";
        
        const filtered = allApplicants.filter(app => {
            // Check status: kapag hindi "Pending", wag isama sa listahan dito
            let status = appStatuses[app.id] || "Pending";
            if (status !== "Pending") return false; 
            
            return (app.name + app.id + app.type).toLowerCase().includes(searchTerm.toLowerCase());
        });

        // KAPAG WALANG LUMABAS SA SEARCH
        if (filtered.length === 0) {
            applicantList.innerHTML = `
                <div class="no-results-msg">
                    <i class="fa-solid fa-folder-open" style="font-size: 24px; color: #cbd5e1; display: block; margin-bottom: 8px;"></i>
                    No applicants found!
                </div>`;
            return;
        }

        filtered.forEach(app => {
            const row = document.createElement('div');
            row.className = 'applicant-row-full';
            row.innerHTML = `
                <div>${app.id}</div>
                <div style="font-weight: 800; color: #0F2D57;">${app.name}</div>
                <div>${app.type}</div>
                <div style="font-size: 11px; color: #64748b; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${app.purpose}</div>
                <div>${app.date}</div>
                <div class="action-cell">
                    <button class="quick-btn quick-approve" onclick="quickAction('${app.id}', 'Approved')"><i class="fa-solid fa-check"></i></button>
                    <button class="quick-btn quick-reject" onclick="quickAction('${app.id}', 'Rejected')"><i class="fa-solid fa-xmark"></i></button>
                    <button class="view-btn" onclick="openModal('${app.id}', 'View')">VIEW</button>
                </div>`;
            applicantList.appendChild(row);
        });
    }

    window.clearSearchField = () => {
        searchInput.value = "";
        renderTable();
    };

    window.quickAction = (id, status) => {
        openModal(id, 'Action');
        selectStatus(status);
    };

    window.openModal = (id, mode) => {
        currentAppId = id;
        const app = allApplicants.find(a => a.id === id);
        if(!app) return;

        document.getElementById('m-id').value = app.id;
        document.getElementById('m-name').value = app.name;
        document.getElementById('m-date').value = app.date;
        document.getElementById('m-type').value = app.type;
        document.getElementById('m-purpose').value = app.purpose;
        document.getElementById('m-email').value = app.email;
        document.getElementById('m-contact').value = app.contact;
        document.getElementById('m-filename').innerText = app.file;

        const updateBtn = document.getElementById('updateAppBtn');
        const adminSection = document.getElementById('adminNoteSection');
        const modalActions = document.getElementById('modalActionButtons');
        const statusText = document.getElementById('modal-status-text');
        const statusDivider = document.getElementById('statusDivider');

        selectedStatus = null;
        document.getElementById('adminNote').value = "";
        document.getElementById('adminNoteLabel').innerHTML = 'ADMIN NOTE:';
        
        document.getElementById('modalCard').classList.remove('error-stroke');
        document.getElementById('errorMessage').style.display = 'none';

        if(mode === 'View') {
            updateBtn.style.display = 'none';
            adminSection.style.display = 'none';
            modalActions.style.display = 'none';
            statusDivider.style.display = 'none';
            statusText.innerText = "PENDING";
            statusText.style.color = "#0F2D57";
        } else {
            updateBtn.style.display = 'block';
            adminSection.style.display = 'flex';
            modalActions.style.display = 'flex';
            statusDivider.style.display = 'block';
            statusText.innerText = "PENDING";
            statusText.style.color = "#0F2D57";
        }
        
        const modal = document.getElementById('modalOverlay');
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('active'), 10);
        document.getElementById('contentBlur').classList.add('blurred');
        document.getElementById('modalForm').style.display = 'block';
        document.getElementById('modalSuccess').style.display = 'none';
    };

    window.viewSubmittedFile = () => {
        const filename = document.getElementById('m-filename').innerText;
        window.open(filename, '_blank'); 
    };

    window.selectStatus = (status) => {
        selectedStatus = status;
        const statusText = document.getElementById('modal-status-text');
        const label = document.getElementById('adminNoteLabel');
        
        document.getElementById('modalCard').classList.remove('error-stroke');
        document.getElementById('errorMessage').style.display = 'none';

        statusText.innerText = status.toUpperCase();
        
        if(status === 'Approved') {
            statusText.style.color = "#0F2D57"; 
            label.innerHTML = 'ADMIN NOTE:<br><span style="color:#059669; font-size:10px; font-weight:800; text-transform:uppercase;">Action: APPROVED</span>';
        } else {
            statusText.style.color = "#0F2D57";
            label.innerHTML = 'ADMIN NOTE:<br><span style="color:#dc2626; font-size:10px; font-weight:800; text-transform:uppercase;">Action: REJECTED</span>';
        }
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
        const note = document.getElementById('adminNote').value.trim();

        let missingFields = [];

        if(!selectedStatus) missingFields.push("Status");
        if(note === "") missingFields.push("Admin Note");

        if(missingFields.length > 0) {
            let errorText = missingFields.length === 1 ? 
                `Missing required field: ${missingFields[0]}!` : 
                `Missing required fields: ${missingFields.join(', ')}!`;
            triggerError(errorText);
            return;
        }
        
        document.getElementById('modalCard').classList.remove('error-stroke');
        document.getElementById('errorMessage').style.display = 'none';

        // BAGONG LOGIC FOR STATUS TRACKING & RECALCULATION
        let appStatuses = JSON.parse(localStorage.getItem('appStatuses')) || {};
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