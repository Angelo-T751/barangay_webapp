document.addEventListener('DOMContentLoaded', () => {
    // 1. UPDATED DATA ARRAY (Removed Applicant 04)
    const allApplicants = [
        { id: '01', name: 'Juan Dela Cruz', type: 'Barangay Clearance', purpose: 'Job Requirement', date: '05/02/26' },
        { id: '02', name: 'Jean ValJean', type: 'Business Permit', purpose: 'Bakery Opening', date: '05/05/26' },
        { id: '03', name: 'Maria Clara', type: 'Indigency', purpose: 'Scholarship', date: '05/09/26' }
    ];

    const searchInput = document.getElementById('searchInput');
    const clearBtn = document.getElementById('clearSearch');
    const applicantList = document.getElementById('applicantList');
    let currentAppId = null;
    let selectedStatus = null;

    // 2. SEARCH LOGIC
    function triggerSearch() {
        renderApplicants(searchInput.value);
    }

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') triggerSearch();
    });

    searchInput.addEventListener('input', () => {
        clearBtn.classList.toggle('visible', searchInput.value.length > 0);
    });

    clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearBtn.classList.remove('visible');
        renderApplicants('');
        searchInput.focus();
    });

    document.getElementById('searchBtn').addEventListener('click', triggerSearch);

    // 3. LOGOUT MODAL
    window.openLogoutModal = function() {
        document.getElementById('logoutModalOverlay').style.display = 'flex';
        document.getElementById('contentBlur').classList.add('blurred');
    }

    window.closeLogoutModal = function() {
        document.getElementById('logoutModalOverlay').style.display = 'none';
        document.getElementById('contentBlur').classList.remove('blurred');
    }

    // 4. MAIN MODAL LOGIC
    window.openModal = function(id, name, type) {
        currentAppId = id;
        selectedStatus = null;
        document.getElementById('m-id').value = id;
        document.getElementById('m-name').value = name;
        document.getElementById('m-type').value = type;
        
        document.getElementById('modal-status-text').innerText = "Pending";
        document.getElementById('modal-status-text').className = "status-display pending";
        document.getElementById('adminNote').value = "";
        document.getElementById('uploadBox').style.display = "none";
        document.getElementById('errorMessage').style.display = "none";
        document.getElementById('modalForm').style.display = "block";
        document.getElementById('modalSuccess').style.display = "none";
        document.getElementById('plusBtn').style.display = "flex";
        document.getElementById('filePreview').style.display = "none";

        document.getElementById('modalOverlay').style.display = 'flex';
        document.getElementById('contentBlur').classList.add('blurred');
    }

    window.closeModal = function() {
        document.getElementById('modalOverlay').style.display = 'none';
        document.getElementById('contentBlur').classList.remove('blurred');
    }

    window.selectStatus = function(choice) {
        selectedStatus = choice;
        const statusText = document.getElementById('modal-status-text');
        statusText.innerText = choice;
        statusText.className = 'status-display ' + choice.toLowerCase();
        document.getElementById('uploadBox').style.display = (choice === 'Approved') ? 'flex' : 'none';
    }

    window.handleFileSelect = function() {
        const fileInput = document.getElementById('fileInput');
        if (fileInput.files.length > 0) {
            document.getElementById('plusBtn').style.display = "none";
            document.getElementById('filePreview').style.display = "block";
            document.getElementById('fileNameDisplay').innerText = fileInput.files[0].name;
        }
    }

    window.validateAndUpdate = function() {
        const note = document.getElementById('adminNote').value.trim();
        const fileUploaded = document.getElementById('fileInput').files.length > 0;
        
        if (selectedStatus && note && (selectedStatus === 'Rejected' || (selectedStatus === 'Approved' && fileUploaded))) {
            let processedIds = JSON.parse(localStorage.getItem('processedIds')) || [];
            processedIds.push(currentAppId);
            localStorage.setItem('processedIds', JSON.stringify(processedIds));
            
            document.getElementById('modalForm').style.display = 'none';
            document.getElementById('modalSuccess').style.display = 'block';
        } else {
            document.getElementById('errorMessage').style.display = 'block';
        }
    }

    // 5. RENDER LOGIC WITH STAGGER ANIMATION
    function renderApplicants(searchTerm = "") {
        const processedIds = JSON.parse(localStorage.getItem('processedIds')) || [];
        applicantList.innerHTML = "";

        const filtered = allApplicants.filter(app => {
            if (processedIds.includes(app.id)) return false;
            const dataString = (app.name + app.id + app.date + app.type).toLowerCase();
            return dataString.includes(searchTerm.toLowerCase());
        });

        filtered.forEach((app, index) => {
            const row = document.createElement('div');
            row.className = 'applicant-row-full';
            
            // Apply the stagger delay here
            row.style.animationDelay = `${index * 0.1}s`; 
            
            row.innerHTML = `
                <div style="color: #64748b;">${app.id}</div>
                <div style="font-weight: 800; color: var(--navy);">${app.name}</div>
                <div>${app.type}</div>
                <div style="color: #64748b; font-size: 11px;">${app.purpose}</div>
                <div>${app.date}</div>
                <div class="action-group">
                    <div class="status-circle-yellow"></div>
                    <button class="btn-wireframe approve" onclick="openModal('${app.id}', '${app.name}', '${app.type}')">
                        <i class="fa-solid fa-check"></i>
                    </button>
                    <button class="btn-wireframe reject" onclick="openModal('${app.id}', '${app.name}', '${app.type}')">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
            `;
            applicantList.appendChild(row);
        });
    }

    renderApplicants();
});