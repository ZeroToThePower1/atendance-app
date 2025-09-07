
const API_BASE = 'https://attendance-server-nkxx.onrender.com/api';


const dateFilter = document.getElementById('date-filter');
const classFilter = document.getElementById('class-filter');
const searchInput = document.getElementById('search');
const recordList = document.querySelector('.record-list');
const statsContainer = document.querySelector('.stats');
const exportAllBtn = document.querySelector('.record-header .export-btn');
const floatingBtn = document.querySelector('.floating-btn');


let allRecords = [];
let filteredRecords = [];


document.addEventListener('DOMContentLoaded', function() {
    loadStatistics();
    loadAttendanceRecords();
    setupEventListeners();
});


function setupEventListeners() {
    dateFilter.addEventListener('change', filterRecords);
    classFilter.addEventListener('change', filterRecords);
    searchInput.addEventListener('input', filterRecords);
    exportAllBtn.addEventListener('click', exportAllData);
    floatingBtn.addEventListener('click', addNewRecord);
}


async function loadStatistics() {
    try {
        const response = await fetch(`${API_BASE}/attendance/stats/overview`);
        if (response.ok) {
            const stats = await response.json();
            updateStatistics(stats);
        } else {
            console.error('Failed to load statistics');
            showError('Failed to load statistics');
        }
    } catch (error) {
        console.error('Error loading statistics:', error);
        showError('Error loading statistics');
    }
}


function updateStatistics(stats) {
    const statCards = statsContainer.querySelectorAll('.stat-card');
    
    statCards[0].querySelector('h3').textContent = stats.totalRecords || 0;
    statCards[1].querySelector('h3').textContent = stats.averageAttendance ? `${stats.averageAttendance}%` : '0%';
    statCards[2].querySelector('h3').textContent = stats.totalClasses || 0;
}


async function loadAttendanceRecords() {
    try {
        showLoading();
        const response = await fetch(`${API_BASE}/attendance`);
        if (response.ok) {
            const records = await response.json();
            allRecords = records;
            filteredRecords = [...records];
            displayRecords(records);
        } else {
            console.error('Failed to load attendance records');
            showError('Failed to load attendance records');
        }
    } catch (error) {
        console.error('Error loading attendance records:', error);
        showError('Error loading attendance records');
    } finally {
        hideLoading();
    }
}


function displayRecords(records) {
    if (records.length === 0) {
        recordList.innerHTML = `
            <div class="no-records">
                <i class="fas fa-clipboard-list"></i>
                <p>No attendance records found</p>
            </div>
        `;
        return;
    }

    recordList.innerHTML = '';
    
    records.forEach(record => {
        const recordItem = document.createElement('div');
        recordItem.className = 'record-item';
        recordItem.innerHTML = `
            <div class="record-date">
                <div>${formatDate(record.date)}</div>
                <div class="class-name">Class: General</div>
            </div>
            <div class="record-stats">
                <div class="record-stat">
                    <span class="present">${record.present}</span>
                    <span>Present</span>
                </div>
                <div class="record-stat">
                    <span class="absent">${record.absent}</span>
                    <span>Absent</span>
                </div>
            </div>
            <div class="record-actions">
                <button class="view-btn" data-date="${record.date}">
                    <i class="fas fa-eye"></i> View
                </button>
                <button class="export-btn" data-date="${record.date}">
                    <i class="fas fa-download"></i> Export
                </button>
            </div>
        `;
        
        recordList.appendChild(recordItem);
    });
    

    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => viewRecordDetails(btn.dataset.date));
    });
    
    document.querySelectorAll('.export-btn').forEach(btn => {
        btn.addEventListener('click', () => exportRecord(btn.dataset.date));
    });
}


function filterRecords() {
    const dateValue = dateFilter.value;
    const classValue = classFilter.value;
    const searchValue = searchInput.value.toLowerCase();
    
    filteredRecords = allRecords.filter(record => {

        if (dateValue !== 'all') {
            const recordDate = new Date(record.date);
            const today = new Date();
            
            if (dateValue === 'today' && !isToday(recordDate)) {
                return false;
            }
            if (dateValue === 'week' && !isThisWeek(recordDate)) {
                return false;
            }
            if (dateValue === 'month' && !isThisMonth(recordDate)) {
                return false;
            }
        }
        
       
        if (classValue !== 'all') {
            
        }
        

        if (searchValue) {
            
            return true; 
        }
        
        return true;
    });
    
    displayRecords(filteredRecords);
}


async function viewRecordDetails(date) {
    try {
        const response = await fetch(`${API_BASE}/attendance/${date}`);
        if (response.ok) {
            const record = await response.json();
            showRecordModal(record);
        } else {
            console.error('Failed to load record details');
            showError('Failed to load record details');
        }
    } catch (error) {
        console.error('Error loading record details:', error);
        showError('Error loading record details');
    }
}


function showRecordModal(record) {

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;
    
    modal.innerHTML = `
        <div style="background: white; padding: 20px; border-radius: 10px; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto;">
            <h2 style="margin-bottom: 20px; color: #6a11cb;">Attendance for ${record.date}</h2>
            <div style="margin-bottom: 20px;">
                <strong>Total Students:</strong> ${record.records.length}<br>
                <strong>Present:</strong> <span style="color: #2ed573;">${record.records.filter(r => r.status === 'Present').length}</span><br>
                <strong>Absent:</strong> <span style="color: #ff4757;">${record.records.filter(r => r.status === 'Absent').length}</span>
            </div>
            <div style="max-height: 300px; overflow-y: auto;">
                <h3 style="margin-bottom: 10px;">Student Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="border-bottom: 2px solid #eee;">
                            <th style="text-align: left; padding: 10px;">Student</th>
                            <th style="text-align: left; padding: 10px;">Status</th>
                            <th style="text-align: left; padding: 10px;">Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${record.records.map(student => `
                            <tr style="border-bottom: 1px solid #eee;">
                                <td style="padding: 10px;">${student.name}</td>
                                <td style="padding: 10px; color: ${student.status === 'Present' ? '#2ed573' : '#ff4757'};">${student.status}</td>
                                <td style="padding: 10px;">${student.timestamp || 'N/A'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <button style="margin-top: 20px; padding: 10px 20px; background: #6a11cb; color: white; border: none; border-radius: 5px; cursor: pointer;">Close</button>
        </div>
    `;
    

    modal.querySelector('button').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    document.body.appendChild(modal);
}


async function exportRecord(date) {
    try {
        const response = await fetch(`${API_BASE}/attendance/${date}`);
        if (response.ok) {
            const record = await response.json();
            exportToCSV(record, `attendance-${date}.csv`);
        } else {
            console.error('Failed to export record');
            showError('Failed to export record');
        }
    } catch (error) {
        console.error('Error exporting record:', error);
        showError('Error exporting record');
    }
}


async function exportAllData() {
    try {
      
        const response = await fetch(`${API_BASE}/attendance`);
        if (response.ok) {
            const records = await response.json();
            
           
            if (records.length > 0) {
                exportToCSV(records, 'all-attendance-records.csv');
            }
        } else {
            console.error('Failed to export all data');
            showError('Failed to export all data');
        }
    } catch (error) {
        console.error('Error exporting all data:', error);
        showError('Error exporting all data');
    }
}


function exportToCSV(data, filename) {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    if (Array.isArray(data)) {
       
        csvContent += "Date,Total Students,Present,Absent,Attendance Rate\n";
        data.forEach(record => {
            csvContent += `${record.date},${record.totalStudents},${record.present},${record.absent},${record.attendanceRate}%\n`;
        });
    } else {
        
        csvContent += "Student Name,Status,Timestamp\n";
        data.records.forEach(student => {
            csvContent += `${student.name},${student.status},${student.timestamp || ''}\n`;
        });
    }
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}


function addNewRecord() {
    
    alert('Redirecting to attendance page...');
    
}


function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

function isToday(date) {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
}

function isThisWeek(date) {
    const today = new Date();
    const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const lastDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));
    return date >= firstDayOfWeek && date <= lastDayOfWeek;
}

function isThisMonth(date) {
    const today = new Date();
    return date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
}

function showLoading() {
    
    recordList.innerHTML = '<div style="text-align: center; padding: 40px;"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';
}

function hideLoading() {
    
}

function showError(message) {
    
    console.error(message);
    alert(message); 

}


