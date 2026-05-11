document.addEventListener('DOMContentLoaded', () => {
    let allApplicants = JSON.parse(localStorage.getItem('allApplicants')) || [
        { id: "01", name: "Juan Dela Cruz", type: "Barangay Clearance", purpose: "Verification of requirements...", date: "05/08/26", email: "applicant@email.com", contact: "0912345678", file: "freddy.jpg" },
        { id: "02", name: "Jean Valjean", type: "Business Permit", purpose: "Verification of requirements...", date: "05/08/26", email: "applicant@email.com", contact: "0912345678", file: "freddy.jpg" },
        { id: "03", name: "Maria Clara", type: "Indigency Certificate", purpose: "Verification of requirements...", date: "05/08/26", email: "applicant@email.com", contact: "0912345678", file: "freddy.jpg" }
    ];

    let appStatuses = JSON.parse(localStorage.getItem('appStatuses')) || {};
    let approvedFiles = JSON.parse(localStorage.getItem('approvedFiles')) || {}; // Connected storage for files

    const applicantList = document.getElementById('applicantList');
    const searchInput = document.getElementById('searchInput');
    let currentAppId = null;
    let selectedStatus = null;
    let replacementFile = null; // To track new file selection

    function renderTable(searchTerm = "") {
        applicantList.innerHTML = "";
        const filtered = allApplicants.filter(app => {
            const status = appStatuses[app.id] || "Pending";
            if (status !== "Approved") return false;
            return (app.name + app.id + app.type).toLowerCase().includes(searchTerm.toLowerCase());
        });

         if (filtered.length === 0) {
            applicantList.innerHTML = `
                <div class="no-results-msg">
                    <i class="fa-solid fa-folder-open" style="font-size: 24px; color: #cbd5e1; display: block; margin-bottom: 8px;"></i>
                    No rejected applicants found!
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

    window.openModal = (id) => {
        currentAppId = id;
        const app = allApplicants.find(a => a.id === id);
        if(!app) return;

        document.getElementById('m-id').value = app.id;
        document.getElementById('m-name').value = app.name;
        document.getElementById('m-date').value = app.date;
        document.getElementById('m-type').value = app.type;

        // LOAD CURRENT FILE
        const existingFile = approvedFiles[id] || "No certificate found";
        document.getElementById('displayExistingFile').innerText = existingFile;

        // Reset edit UI
        replacementFile = null;
        document.getElementById('fileNameDisplay').innerText = "Replace File";
        document.getElementById('adminNote').value = "";
        
        selectedStatus = "Approved"; 
        document.getElementById('modal-status-text').innerText = "APPROVED";
        document.getElementById('modal-status-text').style.color = "#059669";
        document.getElementById('uploadCol').style.display = 'block';

        const modal = document.getElementById('modalOverlay');
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('active'), 10);
        document.getElementById('contentBlur').classList.add('blurred');
        document.getElementById('modalForm').style.display = 'block';
        document.getElementById('modalSuccess').style.display = 'none';
    };

    window.handleFileSelect = (input) => {
        if (input.files && input.files[0]) {
            replacementFile = input.files[0].name;
            document.getElementById('fileNameDisplay').innerText = replacementFile;
        }
    };

    window.selectStatus = (status) => {
        selectedStatus = status;
        const statusText = document.getElementById('modal-status-text');
        const uploadCol = document.getElementById('uploadCol');
        
        document.getElementById('modalCard').classList.remove('error-stroke');
        document.getElementById('errorMessage').style.display = 'none';

        statusText.innerText = status.toUpperCase();
        if(status === 'Pending') {
            statusText.style.color = "#D9A420";
            uploadCol.style.display = 'none';
        } else if(status === 'Rejected') {
            statusText.style.color = "#dc2626";
            uploadCol.style.display = 'none';
        } else {
            statusText.style.color = "#059669";
            uploadCol.style.display = 'block';
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
        if(note === "") {
            triggerError("Admin Note is required to save changes!");
            return;
        }

        // UPDATE STATUS
        appStatuses[currentAppId] = selectedStatus;
        localStorage.setItem('appStatuses', JSON.stringify(appStatuses));

        // UPDATE FILE STORAGE IF NEW FILE UPLOADED
        if (selectedStatus === "Approved" && replacementFile) {
            approvedFiles[currentAppId] = replacementFile;
            localStorage.setItem('approvedFiles', JSON.stringify(approvedFiles));
        }

        // RECALCULATE COUNTS
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
        setTimeout(() => document.getElementById('modalOverlay').style.display = 'none', 300);
        document.getElementById('contentBlur').classList.remove('blurred');
    };

    window.clearSearchField = () => { searchInput.value = ""; renderTable(); };
    window.openLogoutModal = () => { document.getElementById('logoutModalOverlay').style.display = 'flex'; };
    window.closeLogoutModal = () => { document.getElementById('logoutModalOverlay').style.display = 'none'; };

    searchInput.addEventListener('input', (e) => renderTable(e.target.value));
    renderTable();
});