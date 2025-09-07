
let count = 0;
let listofnames = [];


async function initializeApp() {
    try {
        const students = await loadStudentsFromServer();
        if (students && students.length > 0) {
            listofnames = students;
            count = students.length;
            addnewelm(listofnames, count);
        }
    } catch (error) {
        console.error('Error initializing app:', error);
    }
}


async function loadStudentsFromServer() {
    try {
        const response = await fetch('attendance-server-production.up.railway.app/api/students');
        if (response.ok) {
            const students = await response.json();
            console.log('Students loaded from server:', students);
            return students;
        } else {
            console.log('No students found on server, starting fresh');
            return [];
        }
    } catch (error) {
        console.error('Error loading students:', error);
        return [];
    }
}


async function saveStudentsToServer(students) {
    try {
        const response = await fetch('attendance-server-production.up.railway.app/api/students', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(students)
        });
        
        if (response.ok) {
            console.log('Students saved successfully to server');
            return true;
        } else {
            throw new Error('Server returned an error');
        }
    } catch (error) {
        console.error('Error saving students:', error);
        alert('Failed to save students. Please try again.');
        return false;
    }
}


async function saveAttendanceToServer(attendanceRecords) {
    try {
        const response = await fetch('attendance-server-production.up.railway.app/api/attendance', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                date: new Date().toISOString().split('T')[0], // Current date
                records: attendanceRecords
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('Attendance saved successfully:', result);
            return result;
        } else {
            throw new Error('Server returned an error');
        }
    } catch (error) {
        console.error('Error saving attendance:', error);
        alert('Failed to save attendance. Please try again.');
        return null;
    }
}

function addnewelm(list, count) {

    const studentList = document.querySelector(".studentlist");
    studentList.innerHTML = '<div class="total">No of total student(s): ' + count + '</div>';
    
    for (let i = 0; i < list.length; i++) {
        let box = document.createElement('div');
        box.style.padding = '10px';
        box.style.width = '90%';
        box.style.backgroundColor = 'white';
        box.style.borderRadius = '10px';
        box.style.margin = '5px';
        box.style.border = '1px solid black';
        box.innerText = `${i+1}. ${list[i]}`;

        studentList.appendChild(box);
    }
}

async function working(elm) {
    console.log('this is working');
    let newname = document.getElementById('names');

    if (newname.value) {
        count += 1;
        listofnames.push(newname.value);
        addnewelm(listofnames, count);
        

        const success = await saveStudentsToServer(listofnames);
        if (success) {
            document.getElementById('names').value = '';
        } else {
            // Revert changes if save failed
            listofnames.pop();
            count -= 1;
            addnewelm(listofnames, count);
        }
    }
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        working(document.getElementById('addstudent'));
    }
});

async function attending(elm) {
    if (listofnames.length > 0) {
        document.querySelector('.NEW').style.display = 'none';
        document.querySelector('.maintitle').innerText = "Taking Attendance";
        

        let container = document.createElement('div');
        container.className = 'attendance-container';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.alignItems = 'center';
        container.style.gap = '20px';
        container.style.padding = '20px';
        container.style.backgroundColor = '#f5f5f5';
        container.style.borderRadius = '10px';
        container.style.maxWidth = '500px';
        container.style.margin = '20px auto';
        container.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';

        let namebox = document.createElement('div');
        namebox.className = 'student-display';
        namebox.style.width = '250px';
        namebox.style.height = '100px';
        namebox.style.backgroundColor = '#682bd7';
        namebox.style.borderRadius = '15px';
        namebox.style.display = 'flex';
        namebox.style.justifyContent = 'center';
        namebox.style.alignItems = 'center';
        namebox.style.color = 'white';
        namebox.style.fontSize = '24px';
        namebox.style.fontWeight = 'bold';
        namebox.style.textAlign = 'center';
        namebox.style.padding = '10px';
        namebox.innerText = listofnames[0]; 
        

        let statusIndicator = document.createElement('div');
        statusIndicator.className = 'status-indicator';
        statusIndicator.style.fontSize = '16px';
        statusIndicator.style.marginTop = '10px';
        statusIndicator.style.color = '#666';
        statusIndicator.innerText = `Student 1 of ${listofnames.length}`;
        

        let buttonsContainer = document.createElement('div');
        buttonsContainer.style.display = 'flex';
        buttonsContainer.style.gap = '20px';
        buttonsContainer.style.marginTop = '20px';
        

        let absent = document.createElement('button');
        absent.className = 'absent-btn';
        absent.style.width = '100px';
        absent.style.height = '50px';
        absent.style.backgroundColor = '#ff4757';
        absent.style.border = 'none';
        absent.style.borderRadius = '8px';
        absent.style.color = 'white';
        absent.style.fontSize = '16px';
        absent.style.fontWeight = 'bold';
        absent.style.cursor = 'pointer';
        absent.style.transition = 'all 0.2s';
        absent.innerText = "Absent";
        absent.onmouseover = function() { this.style.transform = 'scale(1.05)'; };
        absent.onmouseout = function() { this.style.transform = 'scale(1)'; };
        

        let present = document.createElement('button');
        present.className = 'present-btn';
        present.style.width = '100px';
        present.style.height = '50px';
        present.style.backgroundColor = '#2ed573';
        present.style.border = 'none';
        present.style.borderRadius = '8px';
        present.style.color = 'white';
        present.style.fontSize = '16px';
        present.style.fontWeight = 'bold';
        present.style.cursor = 'pointer';
        present.style.transition = 'all 0.2s';
        present.innerText = "Present";
        present.onmouseover = function() { this.style.transform = 'scale(1.05)'; };
        present.onmouseout = function() { this.style.transform = 'scale(1)'; };
        
     
        buttonsContainer.appendChild(absent);
        buttonsContainer.appendChild(present);
        container.appendChild(namebox);
        container.appendChild(statusIndicator);
        container.appendChild(buttonsContainer);
        

        document.body.appendChild(container);
        

        let attendanceRecords = [];
        let currentStudentIndex = 0;
        

        function updateDisplay() {
            namebox.innerText = listofnames[currentStudentIndex];
            statusIndicator.innerText = `Student ${currentStudentIndex + 1} of ${listofnames.length}`;
        }
        

        async function markAttendance(status) {
 
            let record = {
                name: listofnames[currentStudentIndex],
                status: status,
                timestamp: new Date().toLocaleString()
            };
            
  
            attendanceRecords.push(record);
            console.log("Attendance recorded:", record);
            

            currentStudentIndex++;
            
            if (currentStudentIndex < listofnames.length) {
                updateDisplay();
            } else {
 
                namebox.innerText = "Attendance Complete!";
                namebox.style.backgroundColor = '#2ed573';
                statusIndicator.innerText = `Recorded attendance for ${attendanceRecords.length} students`;
                buttonsContainer.style.display = 'none';
                

                const result = await saveAttendanceToServer(attendanceRecords);
                

                let resultsDiv = document.createElement('div');
                resultsDiv.style.marginTop = '20px';
                resultsDiv.style.padding = '15px';
                resultsDiv.style.backgroundColor = 'white';
                resultsDiv.style.borderRadius = '10px';
                resultsDiv.style.width = '100%';
                
                let resultsTitle = document.createElement('h3');
                resultsTitle.innerText = 'Attendance Results:';
                if (result) {
                    resultsTitle.innerText += ' (Saved to server)';
                    resultsTitle.style.color = 'green';
                }
                resultsTitle.style.marginBottom = '10px';
                resultsDiv.appendChild(resultsTitle);
                
                attendanceRecords.forEach(record => {
                    let recordDiv = document.createElement('div');
                    recordDiv.style.display = 'flex';
                    recordDiv.style.justifyContent = 'space-between';
                    recordDiv.style.padding = '5px 0';
                    recordDiv.style.borderBottom = '1px solid #eee';
                    
                    let nameSpan = document.createElement('span');
                    nameSpan.innerText = record.name;
                    
                    let statusSpan = document.createElement('span');
                    statusSpan.innerText = record.status;
                    statusSpan.style.color = record.status === 'Present' ? '#2ed573' : '#ff4757';
                    statusSpan.style.fontWeight = 'bold';
                    
                    recordDiv.appendChild(nameSpan);
                    recordDiv.appendChild(statusSpan);
                    resultsDiv.appendChild(recordDiv);
                });
                
                container.appendChild(resultsDiv);
                
                console.log("Final attendance records:", attendanceRecords);
            }
        }
        

        absent.addEventListener('click', function() {
            markAttendance('Absent');
        });
        
        present.addEventListener('click', function() {
            markAttendance('Present');
        });
        
    } else {
        alert("Please add students first!");
    }
}



window.addEventListener('load', initializeApp);

