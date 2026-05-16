window.loadNotifications = function() {
    const notifBadge = document.getElementById('notifBadge');
    const notifList = document.getElementById('notifList');
    
    const notifs = JSON.parse(localStorage.getItem('ains_notifications') || '[]');
    const unreadCount = notifs.filter(n => !n.read).length;

    if (notifBadge) {
        notifBadge.innerText = unreadCount;
        notifBadge.style.display = unreadCount > 0 ? 'inline-block' : 'none';
    }

    if (notifList) {
        notifList.innerHTML = '';
        if (notifs.length === 0) {
            notifList.innerHTML = '<div class="notif-empty">No notifications yet.</div>';
        } else {
            notifs.forEach((notif) => {
                const item = document.createElement('div');
                item.className = `notif-item ${notif.read ? '' : 'unread'}`;
                item.innerHTML = `
                    <div class="notif-title">${notif.title}</div>
                    <div class="notif-message">${notif.message}</div>
                    <div class="notif-date">${notif.date}</div>
                `;
                item.addEventListener('click', (e) => {
                    e.stopPropagation(); // Keep dropdown open when clicking an item
                    notif.read = true;
                    localStorage.setItem('ains_notifications', JSON.stringify(notifs));
                    window.loadNotifications();
                });
                notifList.appendChild(item);
            });
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const notifBtn = document.getElementById('notifBtn');
    const notifDropdown = document.getElementById('notifDropdown');
    const markAllReadBtn = document.getElementById('markAllReadBtn');

    if (notifBtn && notifDropdown) {
        notifBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            notifDropdown.classList.toggle('hidden');
        });

        document.addEventListener('click', (e) => {
            if (!notifBtn.contains(e.target) && !notifDropdown.contains(e.target)) {
                notifDropdown.classList.add('hidden');
            }
        });
    }

    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            let notifs = JSON.parse(localStorage.getItem('ains_notifications') || '[]');
            notifs.forEach(n => n.read = true);
            localStorage.setItem('ains_notifications', JSON.stringify(notifs));
            window.loadNotifications();
        });
    }

    window.loadNotifications();
});

// Automatically triggers from the Apply page when a tracking code is generated
window.createNotification = function(title, message) {
    let notifs = JSON.parse(localStorage.getItem('ains_notifications') || '[]');
    
    // Prevent duplicate entries
    if (notifs.length > 0 && notifs[0].message === message) return;

    notifs.unshift({
        id: Date.now(),
        title: title,
        message: message,
        date: new Date().toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' }),
        read: false
    });
    localStorage.setItem('ains_notifications', JSON.stringify(notifs));
    window.loadNotifications();
};