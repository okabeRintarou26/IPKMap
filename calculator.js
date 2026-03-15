const MAX_SEMESTERS = 14;
const MAX_SKS_PER_COURSE = 6;
const MIN_SKS_PER_COURSE = 1;
const DEFAULT_MIN_SKS_PER_SEMESTER = 18;
const DEFAULT_MAX_SKS_PER_SEMESTER = 24;
const MAX_TOTAL_SKS = 160;

const GRADE_MAP = {
    'A': 4.0,
    'A-': 3.7,
    'B+': 3.3,
    'B': 3.0,
    'B-': 2.7,
    'C+': 2.3,
    'C': 2.0,
    'D': 1.0,
    'E': 0.0,
    '4.0': 4.0,
    '3.7': 3.7,
    '3.3': 3.3,
    '3.0': 3.0,
    '2.7': 2.7,
    '2.3': 2.3,
    '2.0': 2.0,
    '1.0': 1.0,
    '0.0': 0.0
};

let ipkChart = null;
let ipsChart = null;

document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    initializeFirstSemesterSks();
    updateTotalSksDisplay('ipk');
});

function setupEventListeners() {
    document.getElementById('btnIPK').addEventListener('click', () => toggleSection('ipk'));
    document.getElementById('btnIPS').addEventListener('click', () => toggleSection('ips'));

    document.getElementById('prevTotalSks').addEventListener('change', function() {
        calculateEstimatedSemesters();
    });
}

function initializeFirstSemesterSks() {
    const sksMode = document.querySelector('input[name="ipkSksMode"]:checked').value;
    const firstSemester = document.querySelector('.semester-group');
    
    if (sksMode === 'auto') {
        const randomMax = getRandomSemesterMax(DEFAULT_MIN_SKS_PER_SEMESTER, DEFAULT_MAX_SKS_PER_SEMESTER);
        firstSemester.querySelector('.semester-sks-max').textContent = randomMax;
        firstSemester.querySelector('.semester-max-sks-input').classList.add('hidden');
    } else {
        firstSemester.querySelector('.semester-sks-max').textContent = DEFAULT_MIN_SKS_PER_SEMESTER;
        firstSemester.querySelector('.semester-max-sks-input').classList.remove('hidden');
    }
}

function getRandomSemesterMax(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function toggleSksMode(type) {
    if (type !== 'ipk') return;

    const mode = document.querySelector('input[name="ipkSksMode"]:checked').value;
    const manualSettings = document.getElementById('manualSksGlobalSettings');
    const semesters = document.querySelectorAll('.semester-group');

    if (mode === 'auto') {
        manualSettings.classList.add('hidden');
        semesters.forEach(semester => {
            const input = semester.querySelector('.semester-max-sks-input');
            if (input) input.classList.add('hidden');
            
            const randomMax = getRandomSemesterMax(DEFAULT_MIN_SKS_PER_SEMESTER, DEFAULT_MAX_SKS_PER_SEMESTER);
            semester.querySelector('.semester-sks-max').textContent = randomMax;
        });
    } else {
        manualSettings.classList.remove('hidden');
        semesters.forEach(semester => {
            const input = semester.querySelector('.semester-max-sks-input');
            if (input) input.classList.remove('hidden');
        });
    }

    showSuccess(`✅ Mode ${mode === 'auto' ? 'Otomatis' : 'Manual'} diaktifkan!`);
}

function updateSemesterMax(inputElement) {
    const value = parseInt(inputElement.value) || DEFAULT_MIN_SKS_PER_SEMESTER;

    if (value < DEFAULT_MIN_SKS_PER_SEMESTER || value > DEFAULT_MAX_SKS_PER_SEMESTER) {
        showError(`❌ SKS per semester harus antara ${DEFAULT_MIN_SKS_PER_SEMESTER}-${DEFAULT_MAX_SKS_PER_SEMESTER}!`);
        inputElement.value = DEFAULT_MIN_SKS_PER_SEMESTER;
        return;
    }

    const semester = inputElement.closest('.semester-group');
    semester.querySelector('.semester-sks-max').textContent = value;
    updateSemesterSks('ipkCourseList');
    showSuccess('✅ Batas SKS semester diperbarui!');
}

function toggleSection(section) {
    const ipkSection = document.getElementById('ipkSection');
    const ipsSection = document.getElementById('ipsSection');

    if (section === 'ipk') {
        ipkSection.classList.remove('hidden');
        ipsSection.classList.add('hidden');
        
        const ipsToggle = document.querySelector('.display-toggle-section[data-method="ips"]');
        if (ipsToggle) {
            ipsToggle.classList.remove('hidden');
        }
    } else {
        ipkSection.classList.add('hidden');
        ipsSection.classList.remove('hidden');
        
        const ipkToggles = document.querySelectorAll('.display-toggle-section[data-method="ipk"], .display-toggle-section[data-method="ipkPrev"]');
        ipkToggles.forEach(toggle => {
            toggle.classList.add('hidden');
        });
    }
}

function toggleIPKMethod() {
    const method = document.querySelector('input[name="ipkMethod"]:checked').value;
    const perCourseMethod = document.getElementById('ipkPerCourseMethod');
    const prevSemesterMethod = document.getElementById('ipkPreviousSemesterMethod');
    const sksGroupingSection = document.getElementById('ipkSksGroupingSection');

    const ipkToggleSections = document.querySelectorAll('.display-toggle-section[data-method="ipk"], .display-toggle-section[data-method="ipkPrev"]');
    ipkToggleSections.forEach(section => {
        section.classList.add('hidden');
    });

    if (method === 'perCourse') {
        perCourseMethod.classList.remove('hidden');
        prevSemesterMethod.classList.add('hidden');
        sksGroupingSection.classList.remove('hidden');
        
        document.querySelector('.display-toggle-section[data-method="ipk"]').classList.remove('hidden');
    } else {
        perCourseMethod.classList.add('hidden');
        prevSemesterMethod.classList.remove('hidden');
        sksGroupingSection.classList.add('hidden');
        document.querySelector('.display-toggle-section[data-method="ipkPrev"]').classList.remove('hidden');
    }
}

function toggleCourseNameDisplay(type) {
    let checkboxId = '';
    let courseNameGroups = [];
    if (type === 'ipk') {
        checkboxId = 'showCourseNameIPK';
        const semesterContainer = document.getElementById('ipkSemesterContainer');
        if (semesterContainer) {
            courseNameGroups = Array.from(
                semesterContainer.querySelectorAll('.course-name-group[data-method="ipk"]')
            );
        }
    } else if (type === 'ipkPrev') {
        checkboxId = 'showCourseNameIPKPrev';
        const prevContainer = document.getElementById('ipkPrevCourseList');
        if (prevContainer) {
            courseNameGroups = Array.from(
                prevContainer.querySelectorAll('.course-name-group[data-method="ipkPrev"]')
            );
        }
    } else if (type === 'ips') {
        checkboxId = 'showCourseNameIPS';
        const ipsContainer = document.getElementById('ipsCourseList');
        if (ipsContainer) {
            courseNameGroups = Array.from(
                ipsContainer.querySelectorAll('.course-name-group[data-method="ips"]')
            );
        }
    }

    const checkbox = document.getElementById(checkboxId);
    
    if (!checkbox) {
        console.warn(`Checkbox tidak ditemukan: ${checkboxId}`);
        return;
    }

    if (courseNameGroups.length === 0) {
        console.warn(`Tidak ada course-name-group ditemukan untuk type: ${type}`);
        return;
    }

    const isChecked = checkbox.checked;
    courseNameGroups.forEach(group => {
        if (isChecked) {
            group.classList.remove('hidden');
        } else {
            group.classList.add('hidden');
        }
    });
}

function getGradeValue(gradeInput) {
    const value = gradeInput.value.toUpperCase().trim();
    
    if (GRADE_MAP.hasOwnProperty(value)) {
        return GRADE_MAP[value];
    }

    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 4) {
        return numValue;
    }

    return null;
}

function addCourse(listId) {
    const courseList = document.getElementById(listId);
    
    if (!courseList) {
        showError('❌ Daftar mata kuliah tidak ditemukan!');
        return;
    }

    if (listId === 'ipkCourseList' || listId.startsWith('ipkCourseList')) {
        const semesterGroup = courseList.closest('.semester-group');
        const currentSks = calculateSemesterSks(semesterGroup);
        const maxSks = parseInt(semesterGroup.querySelector('.semester-sks-max').textContent);
        
        if (currentSks >= maxSks) {
            showError(`❌ SKS semester sudah mencapai maksimal ${maxSks} SKS. Tidak bisa menambah mata kuliah baru.`);
            return;
        }
    }

    if (listId === 'ipkPrevCourseList') {
        const totalSks = calculateTotalSksPrevSemester();
        const prevTotalSks = parseFloat(document.getElementById('prevTotalSks').value) || 0;
        
        if ((totalSks + prevTotalSks) >= MAX_TOTAL_SKS) {
            showError(`❌ Total SKS keseluruhan sudah mencapai maksimal ${MAX_TOTAL_SKS} SKS.`);
            return;
        }
    }

    if (listId === 'ipsCourseList') {
        const maxSks = DEFAULT_MAX_SKS_PER_SEMESTER;
        const totalSks = calculateTotalSksIps();
        
        if (totalSks >= maxSks) {
            showError(`❌ Total SKS semester sudah mencapai maksimal ${maxSks} SKS.`);
            return;
        }
    }

    const newCourse = createCourseElement(listId);
    courseList.appendChild(newCourse);
    showSuccess(`✅ Mata kuliah baru ditambahkan!`);
}

function createCourseElement(listId) {
    const courseDiv = document.createElement('div');
    courseDiv.className = 'course-item';
    
    const showCourseName = getShowCourseNameStatus(listId);
    const courseNameClass = showCourseName ? '' : 'hidden';

    const method = getTypeFromListId(listId);

    courseDiv.innerHTML = `
        <div class="form-row">
            <div class="form-group course-name-group ${courseNameClass}" data-method="${method}">
                <label>Nama Mata Kuliah (Opsional)</label>
                <input type="text" class="courseName" placeholder="Contoh: Kalkulus I">
            </div>
            <div class="form-group">
                <label>SKS <span class="required">*</span></label>
                <input type="number" class="sks" placeholder="Contoh: 3" min="1" max="6" required onchange="updateSemesterSks('${listId}')">
            </div>
            <div class="form-group">
                <label>Mutu <span class="required">*</span></label>
                <input type="text" class="grade" list="gradeList" placeholder="Ketik atau pilih (A-E/0-4)">
            </div>
            <div class="form-group btn-delete-wrapper">
                <button type="button" class="btn btn-danger btn-small remove-course" onclick="removeCourse(this, '${getTypeFromListId(listId)}')">
                    ✕ Hapus
                </button>
            </div>
        </div>
    `;

    return courseDiv;
}

function getShowCourseNameStatus(listId) {
    if (listId === 'ipkCourseList' || listId.startsWith('ipkCourseList')) {
        return document.getElementById('showCourseNameIPK').checked;
    } else if (listId === 'ipkPrevCourseList') {
        return document.getElementById('showCourseNameIPKPrev').checked;
    } else if (listId === 'ipsCourseList') {
        return document.getElementById('showCourseNameIPS').checked;
    }
    return true;
}

function getTypeFromListId(listId) {
    if (listId === 'ipkCourseList' || listId.startsWith('ipkCourseList')) return 'ipk';
    if (listId === 'ipkPrevCourseList') return 'ipkPrev';
    if (listId === 'ipsCourseList') return 'ips';
    return '';
}

function removeCourse(button, type) {
    const courseItem = button.closest('.course-item');
    courseItem.remove();
    showSuccess('✅ Mata kuliah dihapus!');
    
    if (type === 'ipk') {
        updateSemesterSks('ipkCourseList');
        updateTotalSksDisplay('ipk');
    } else if (type === 'ipkPrev') {
        updateTotalSksDisplay('ipkPrev');
    } else if (type === 'ips') {
        updateTotalSksDisplay('ips');
    }
}

function removeSemester(button) {
    const container = document.getElementById('ipkSemesterContainer');
    const semesters = container.querySelectorAll('.semester-group');

    if (semesters.length <= 1) {
        showError('❌ Minimal harus ada 1 semester! Tidak bisa menghapus semester terakhir.');
        return;
    }

    const semesterToRemove = button.closest('.semester-group');
    const semesterNum = semesterToRemove.getAttribute('data-semester');
    
    semesterToRemove.remove();

    renumberSemesters();
    
    updateSemesterCounter();
    updateTotalSksDisplay('ipk');
    showSuccess(`✅ Semester ${semesterNum} dihapus! Semester berikutnya akan diubah nomor sesuai urutan.`);
}

function renumberSemesters() {
    const container = document.getElementById('ipkSemesterContainer');
    const semesters = container.querySelectorAll('.semester-group');

    semesters.forEach((semester, index) => {
        const newSemesterNum = index + 1;
        semester.setAttribute('data-semester', newSemesterNum);
        
        const header = semester.querySelector('h4');
        header.textContent = `📖 Semester ${newSemesterNum}`;
        
        const courseList = semester.querySelector('.course-list');
        courseList.id = `ipkCourseList${newSemesterNum}`;
        
        const addButton = semester.querySelector('.add-course-semester');
        addButton.setAttribute('onclick', `addCourse('ipkCourseList${newSemesterNum}')`);
    });
}

function addSemester(type) {
    if (type !== 'ipk') return;

    const container = document.getElementById('ipkSemesterContainer');
    const currentCount = container.querySelectorAll('.semester-group').length;

    if (currentCount >= MAX_SEMESTERS) {
        showError(`❌ Maksimal ${MAX_SEMESTERS} semester. Tidak bisa menambah semester baru.`);
        return;
    }

    const newSemesterNum = currentCount + 1;
    const newSemester = document.createElement('div');
    newSemester.className = 'semester-group';
    newSemester.setAttribute('data-semester', newSemesterNum);
    
    const sksMode = document.querySelector('input[name="ipkSksMode"]:checked').value;
    let maxSksValue = DEFAULT_MIN_SKS_PER_SEMESTER;
    let showMaxInput = 'hidden';

    if (sksMode === 'auto') {
        maxSksValue = getRandomSemesterMax(DEFAULT_MIN_SKS_PER_SEMESTER, DEFAULT_MAX_SKS_PER_SEMESTER);
    } else {
        showMaxInput = '';
    }

    const showCourseName = document.getElementById('showCourseNameIPK').checked;
    const courseNameClass = showCourseName ? '' : 'hidden';

    newSemester.innerHTML = `
        <div class="semester-header">
            <div>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <h4>📖 Semester ${newSemesterNum}</h4>
                    <button type="button" class="btn btn-danger btn-small" onclick="removeSemester(this)" style="width: 60px; padding: 5px 8px; font-size: 0.8em;" title="Hapus semester ini">
                        🗑️ Hapus
                    </button>
                </div>
                <div class="semester-sks-max-input ${showMaxInput}" style="margin-top: 10px;">
                    <label style="color: var(--text-secondary); font-size: 0.9em;">Max SKS Semester:</label>
                    <input type="number" class="semester-max-sks-input" value="${maxSksValue}" min="18" max="24" style="width: 80px; padding: 5px; margin-top: 5px;" onchange="updateSemesterMax(this)">
                </div>
            </div>
            <div class="sks-counter">
                <span>Total SKS: <span class="semester-sks-count">0</span>/<span class="semester-sks-max">${maxSksValue}</span></span>
            </div>
        </div>
        <div class="course-list" id="ipkCourseList${newSemesterNum}">
            <div class="course-item">
                <div class="form-row">
                    <div class="form-group course-name-group ${courseNameClass}" data-method="ipk">
                        <label>Nama Mata Kuliah (Opsional)</label>
                        <input type="text" class="courseName" placeholder="Contoh: Kalkulus I">
                    </div>
                    <div class="form-group">
                        <label>SKS <span class="required">*</span></label>
                        <input type="number" class="sks" placeholder="Contoh: 3" min="1" max="6" required onchange="updateSemesterSks('ipk')">
                    </div>
                    <div class="form-group">
                        <label>Mutu <span class="required">*</span></label>
                        <input type="text" class="grade" list="gradeList" placeholder="Ketik atau pilih (A-E/0-4)">
                    </div>
                    <div class="form-group btn-delete-wrapper">
                        <button type="button" class="btn btn-danger btn-small remove-course" onclick="removeCourse(this, 'ipk')">
                            ✕ Hapus
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <button type="button" class="btn btn-info btn-small add-course-semester" onclick="addCourse('ipkCourseList${newSemesterNum}')">
            ➕ Tambah Mata Kuliah
        </button>
    `;

    container.appendChild(newSemester);
    updateSemesterCounter();
    updateTotalSksDisplay('ipk');
    showSuccess(`✅ Semester ${newSemesterNum} ditambahkan (max ${maxSksValue} SKS)!`);
}

function calculateSemesterSks(semesterGroup) {
    const courseItems = semesterGroup.querySelectorAll('.course-item');
    let totalSks = 0;

    courseItems.forEach(item => {
        const sksInput = item.querySelector('.sks');
        if (sksInput && sksInput.value) {
            totalSks += parseFloat(sksInput.value) || 0;
        }
    });

    return totalSks;
}

function updateSemesterSks(listId) {
    const semesters = document.querySelectorAll('.semester-group');
    
    semesters.forEach(semester => {
        const courseList = semester.querySelector('.course-list');
        if (courseList && (courseList.id === listId || courseList.id.startsWith('ipkCourseList'))) {
            const totalSks = calculateSemesterSks(semester);
            const maxSks = parseInt(semester.querySelector('.semester-sks-max').textContent);
            const sksCounter = semester.querySelector('.semester-sks-count');
            
            if (sksCounter) {
                sksCounter.textContent = totalSks;
            }

            if (totalSks > maxSks) {
                showError(`⚠️ Total SKS semester melebihi batas maksimal ${maxSks} SKS.`);
            }
        }
    });

    updateTotalSksDisplay('ipk');
}

function calculateTotalSksAllSemesters() {
    const semesters = document.querySelectorAll('.semester-group');
    let totalSks = 0;

    semesters.forEach(semester => {
        const courseItems = semester.querySelectorAll('.course-item');
        courseItems.forEach(item => {
            const sksInput = item.querySelector('.sks');
            if (sksInput && sksInput.value) {
                totalSks += parseFloat(sksInput.value) || 0;
            }
        });
    });

    return totalSks;
}

function calculateTotalSksPrevSemester() {
    const courseList = document.getElementById('ipkPrevCourseList');
    const courseItems = courseList.querySelectorAll('.course-item');
    let totalSks = 0;

    courseItems.forEach(item => {
        const sksInput = item.querySelector('.sks');
        if (sksInput && sksInput.value) {
            totalSks += parseFloat(sksInput.value) || 0;
        }
    });

    return totalSks;
}

function calculateTotalSksIps() {
    const courseList = document.getElementById('ipsCourseList');
    const courseItems = courseList.querySelectorAll('.course-item');
    let totalSks = 0;

    courseItems.forEach(item => {
        const sksInput = item.querySelector('.sks');
        if (sksInput && sksInput.value) {
            totalSks += parseFloat(sksInput.value) || 0;
        }
    });

    return totalSks;
}

function updateTotalSksDisplay(type) {
    if (type === 'ipk') {
        const totalSks = calculateTotalSksAllSemesters();
        const counter = document.getElementById('totalSksCount');
        if (counter) {
            counter.textContent = `Total SKS keseluruhan: ${totalSks}/${MAX_TOTAL_SKS}`;
            
            if (totalSks > MAX_TOTAL_SKS) {
                counter.style.color = 'var(--danger-color)';
            } else {
                counter.style.color = 'var(--text-secondary)';
            }
        }
    }
}

function calculateEstimatedSemesters() {
    const prevTotalSks = parseFloat(document.getElementById('prevTotalSks').value) || 0;
    
    if (prevTotalSks <= 0) {
        document.getElementById('prevSemesterInfo').classList.add('hidden');
        return;
    }

    let remainingSks = prevTotalSks;
    const semesters = [];
    let semesterNum = 1;

    while (remainingSks > 0 && semesterNum <= MAX_SEMESTERS) {
        const maxPossible = getRandomSemesterMax(DEFAULT_MIN_SKS_PER_SEMESTER, DEFAULT_MAX_SKS_PER_SEMESTER);
        const sksThisSemester = Math.min(maxPossible, remainingSks);
        semesters.push({ semester: semesterNum, sks: sksThisSemester });
        remainingSks -= sksThisSemester;
        semesterNum++;
    }

    const info = document.getElementById('prevSemesterInfo');
    const calculatedSemesters = document.getElementById('calculatedSemesters');
    
    let breakdownText = '';
    semesters.forEach(s => {
        breakdownText += `Semester ${s.semester} = ${s.sks} SKS | `;
    });
    breakdownText = breakdownText.slice(0, -3);

    calculatedSemesters.innerHTML = `
        <p style="margin-bottom: 10px;"><strong>Estimasi Semester yang Sudah Ditempuh: ${semesters.length} semester</strong></p>
        <p style="margin-bottom: 0; font-size: 0.9em; color: var(--text-secondary);">${breakdownText}</p>
    `;
    info.classList.remove('hidden');
}

function calculateIPK() {
    const semesters = document.querySelectorAll('.semester-group');
    let totalGrade = 0;
    let totalSks = 0;
    const semesterData = [];

    let isValid = true;

    semesters.forEach(semester => {
        const semesterNum = semester.getAttribute('data-semester');
        let semesterGrade = 0;
        let semesterSks = 0;

        const courseItems = semester.querySelectorAll('.course-item');
        
        if (courseItems.length === 0) {
            showError('❌ Minimal ada 1 mata kuliah per semester!');
            isValid = false;
            return;
        }

        courseItems.forEach(item => {
            const sksInput = item.querySelector('.sks');
            const gradeInput = item.querySelector('.grade');

            if (!sksInput.value) {
                showError('❌ Semua SKS harus diisi!');
                isValid = false;
                return;
            }

            const gradeValue = getGradeValue(gradeInput);
            if (gradeValue === null) {
                showError('❌ Semua Mutu harus diisi dengan benar (huruf atau angka 0-4)!');
                isValid = false;
                return;
            }

            const sks = parseFloat(sksInput.value);
            semesterGrade += gradeValue * sks;
            semesterSks += sks;
            totalGrade += gradeValue * sks;
            totalSks += sks;
        });

        if (semesterSks > 0) {
            semesterData.push({
                semester: semesterNum,
                ips: semesterGrade / semesterSks,
                sks: semesterSks
            });
        }
    });

    if (!isValid || totalSks === 0) {
        if (!isValid) return;
        showError('❌ Data tidak valid atau kosong!');
        return;
    }

    if (totalSks > MAX_TOTAL_SKS) {
        showError(`❌ Total SKS (${totalSks}) melebihi batas maksimal ${MAX_TOTAL_SKS} SKS!`);
        return;
    }

    const ipk = totalGrade / totalSks;

    displayIPKResults(ipk, totalSks, totalGrade, semesterData);
    showSuccess('✅ IPK berhasil dihitung!');
}

function displayIPKResults(ipk, totalSks, totalGrade, semesterData) {
    document.getElementById('ipkValue').textContent = ipk.toFixed(2);
    document.getElementById('totalSksIPK').textContent = totalSks.toFixed(0);
    document.getElementById('totalGradeIPK').textContent = totalGrade.toFixed(2);

    document.getElementById('ipkResults').classList.remove('hidden');

    drawIPKChart(semesterData);
}

function drawIPKChart(semesterData) {
    const ctx = document.getElementById('ipkChart');
    if (!ctx) return;

    const container = document.getElementById('ipkChartContainer');
    container.classList.remove('hidden');

    if (ipkChart) {
        ipkChart.destroy();
    }

    const labels = semesterData.map(d => `Semester ${d.semester}`);
    const ipsValues = semesterData.map(d => d.ips.toFixed(2));

    ipkChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'IPS per Semester',
                data: ipsValues,
                borderColor: '#00d4ff',
                backgroundColor: 'rgba(0, 212, 255, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#00d4ff',
                pointBorderColor: '#0099cc',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    labels: { color: '#e0e0e0' }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 4,
                    ticks: { color: '#e0e0e0' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                x: {
                    ticks: { color: '#e0e0e0' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                }
            }
        }
    });
}

function calculateIPKPrev() {
    const prevTotalGrade = parseFloat(document.getElementById('prevTotalGrade').value) || 0;
    const prevTotalSks = parseFloat(document.getElementById('prevTotalSks').value) || 0;

    if (prevTotalSks === 0 || prevTotalGrade === 0) {
        showError('❌ Total Mutu dan SKS semester lalu tidak boleh kosong!');
        return;
    }

    const courseList = document.getElementById('ipkPrevCourseList');
    const courseItems = courseList.querySelectorAll('.course-item');

    let newTotalGrade = 0;
    let newTotalSks = 0;
    let isValid = true;

    if (courseItems.length === 0) {
        showError('❌ Minimal ada 1 mata kuliah baru!');
        return;
    }

    courseItems.forEach(item => {
        const sksInput = item.querySelector('.sks');
        const gradeInput = item.querySelector('.grade');

        if (!sksInput.value) {
            showError('❌ Semua SKS harus diisi!');
            isValid = false;
            return;
        }

        const gradeValue = getGradeValue(gradeInput);
        if (gradeValue === null) {
            showError('❌ Semua Mutu harus diisi dengan benar!');
            isValid = false;
            return;
        }

        const sks = parseFloat(sksInput.value);
        newTotalGrade += gradeValue * sks;
        newTotalSks += sks;
    });

    if (!isValid) {
        return;
    }

    const combinedTotalGrade = prevTotalGrade + newTotalGrade;
    const combinedTotalSks = prevTotalSks + newTotalSks;

    if (combinedTotalSks > MAX_TOTAL_SKS) {
        showError(`❌ Total SKS (${combinedTotalSks}) melebihi batas maksimal ${MAX_TOTAL_SKS} SKS!`);
        return;
    }

    const ipk = combinedTotalGrade / combinedTotalSks;

    document.getElementById('ipkValue').textContent = ipk.toFixed(2);
    document.getElementById('totalSksIPK').textContent = combinedTotalSks.toFixed(0);
    document.getElementById('totalGradeIPK').textContent = combinedTotalGrade.toFixed(2);

    document.getElementById('ipkResults').classList.remove('hidden');
    showSuccess('✅ IPK berhasil dihitung!');
}

function calculateIPS() {
    const courseList = document.getElementById('ipsCourseList');
    const courseItems = courseList.querySelectorAll('.course-item');

    let totalGrade = 0;
    let totalSks = 0;
    let isValid = true;

    if (courseItems.length === 0) {
        showError('❌ Minimal ada 1 mata kuliah!');
        return;
    }

    courseItems.forEach(item => {
        const sksInput = item.querySelector('.sks');
        const gradeInput = item.querySelector('.grade');

        if (!sksInput.value) {
            showError('❌ Semua SKS harus diisi!');
            isValid = false;
            return;
        }

        const gradeValue = getGradeValue(gradeInput);
        if (gradeValue === null) {
            showError('❌ Semua Mutu harus diisi dengan benar!');
            isValid = false;
            return;
        }

        const sks = parseFloat(sksInput.value);
        totalGrade += gradeValue * sks;
        totalSks += sks;
    });

    if (!isValid || totalSks === 0) {
        if (!isValid) return;
        showError('❌ Data tidak valid atau kosong!');
        return;
    }

    const ips = totalGrade / totalSks;

    document.getElementById('ipsValue').textContent = ips.toFixed(2);
    document.getElementById('totalSksIPS').textContent = totalSks.toFixed(0);
    document.getElementById('totalGradeIPS').textContent = totalGrade.toFixed(2);

    document.getElementById('ipsResults').classList.remove('hidden');

    drawIPSChart();
    showSuccess('✅ IPS berhasil dihitung!');
}

function drawIPSChart() {
    const ctx = document.getElementById('ipsChart');
    if (!ctx) return;

    const courseList = document.getElementById('ipsCourseList');
    const courseItems = courseList.querySelectorAll('.course-item');

    const labels = [];
    const grades = [];

    courseItems.forEach((item, index) => {
        const courseName = item.querySelector('.courseName').value || `Mata Kuliah ${index + 1}`;
        const gradeInput = item.querySelector('.grade');
        const gradeValue = getGradeValue(gradeInput);

        labels.push(courseName);
        grades.push(gradeValue);
    });

    if (ipsChart) {
        ipsChart.destroy();
    }

    ipsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Nilai Mutu',
                data: grades,
                backgroundColor: [
                    'rgba(0, 212, 255, 0.8)',
                    'rgba(0, 153, 204, 0.8)',
                    'rgba(0, 217, 126, 0.8)',
                    'rgba(255, 165, 0, 0.8)',
                    'rgba(255, 51, 102, 0.8)'
                ],
                borderColor: '#00d4ff',
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    labels: { color: '#e0e0e0' }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    max: 4,
                    ticks: { color: '#e0e0e0' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                y: {
                    ticks: { color: '#e0e0e0' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                }
            }
        }
    });
}


function calculateTargetIPK() {
    const targetIPK = parseFloat(document.getElementById('targetIPK').value);

    if (!targetIPK || targetIPK < 0 || targetIPK > 4) {
        showError('❌ Target IPK harus antara 0-4!');
        return;
    }

    const currentIPKText = document.getElementById('ipkValue').textContent;
    const currentSksText = document.getElementById('totalSksIPK').textContent;
    const currentGradeText = document.getElementById('totalGradeIPK').textContent;

    if (currentIPKText === '-' || currentSksText === '-') {
        showError('❌ Silakan hitung IPK terlebih dahulu!');
        return;
    }

    const currentIPK = parseFloat(currentIPKText);
    const currentSks = parseFloat(currentSksText);
    const currentGrade = parseFloat(currentGradeText);

    const remainingSks = MAX_TOTAL_SKS - currentSks;
    
    if (remainingSks <= 0) {
        showError('❌ Anda sudah mencapai batas maksimal SKS (160)!');
        return;
    }

    const avgSksPerSemester = (DEFAULT_MIN_SKS_PER_SEMESTER + DEFAULT_MAX_SKS_PER_SEMESTER) / 2;
    const completedSemesters = Math.round(currentSks / avgSksPerSemester);
    const remainingSemesters = MAX_SEMESTERS - completedSemesters;

    if (remainingSemesters <= 0) {
        showError('❌ Estimasi semester sudah mencapai batas maksimal (14)!');
        return;
    }

    const requiredTotalGrade = targetIPK * MAX_TOTAL_SKS;
    const totalGradeNeeded = requiredTotalGrade - currentGrade;
    const requiredGradePerSks = totalGradeNeeded / remainingSks;

    const requiredGradePerSemester = requiredGradePerSks * avgSksPerSemester;

    const resultDiv = document.getElementById('targetIPKResult');
    
    let statusColor = 'var(--success-color)';
    let statusMessage = '✅ Target dapat dicapai!';

    if (requiredGradePerSks > 4) {
        statusColor = 'var(--danger-color)';
        statusMessage = '❌ Target tidak mungkin dicapai! Mutu per SKS melebihi 4.0';
    } else if (requiredGradePerSks < 0) {
        statusColor = 'var(--success-color)';
        statusMessage = '✅ Target sudah tercapai atau terlampaui!';
    }

    resultDiv.innerHTML = `
        <h4 style="color: var(--primary-color); margin-bottom: 15px;">📊 Analisis Target IPK</h4>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 15px;">
            <div style="background: rgba(0, 0, 0, 0.2); padding: 12px; border-radius: 6px; border-left: 4px solid var(--primary-color);">
                <p style="color: var(--text-secondary); font-size: 0.9em; margin-bottom: 5px;">IPK Saat Ini</p>
                <p style="color: var(--primary-color); font-size: 1.5em; font-weight: bold;">${currentIPK.toFixed(2)}</p>
            </div>
            
            <div style="background: rgba(0, 0, 0, 0.2); padding: 12px; border-radius: 6px; border-left: 4px solid var(--warning-color);">
                <p style="color: var(--text-secondary); font-size: 0.9em; margin-bottom: 5px;">Target IPK</p>
                <p style="color: var(--warning-color); font-size: 1.5em; font-weight: bold;">${targetIPK.toFixed(2)}</p>
            </div>
            
            <div style="background: rgba(0, 0, 0, 0.2); padding: 12px; border-radius: 6px; border-left: 4px solid var(--info-color);">
                <p style="color: var(--text-secondary); font-size: 0.9em; margin-bottom: 5px;">SKS Sudah Ditempuh</p>
                <p style="color: var(--info-color); font-size: 1.5em; font-weight: bold;">${currentSks.toFixed(0)}/160</p>
            </div>
        </div>
        
        <div style="background: rgba(0, 0, 0, 0.2); padding: 12px; border-radius: 6px; border-left: 4px solid var(--primary-color); margin-bottom: 15px;">
            <p style="color: var(--text-secondary); font-size: 0.9em; margin-bottom: 5px;">Semester yang Sudah Ditempuh</p>
            <p style="color: var(--primary-color); font-size: 1.3em; font-weight: bold;">${completedSemesters} Semester</p>
            <p style="color: var(--text-secondary); font-size: 0.85em; margin-top: 5px;">(Estimasi berdasarkan rata-rata ${avgSksPerSemester.toFixed(1)} SKS/semester)</p>
        </div>
        
        <div style="background: rgba(0, 0, 0, 0.2); padding: 12px; border-radius: 6px; border-left: 4px solid var(--info-color); margin-bottom: 15px;">
            <p style="color: var(--text-secondary); font-size: 0.9em; margin-bottom: 5px;">Semester Tersisa Sampai Lulus</p>
            <p style="color: var(--info-color); font-size: 1.3em; font-weight: bold;">${remainingSemesters} Semester</p>
            <p style="color: var(--text-secondary); font-size: 0.85em; margin-top: 5px;">(Dari total max 14 semester)</p>
        </div>
        
        <div style="background: rgba(0, 0, 0, 0.2); padding: 12px; border-radius: 6px; border-left: 4px solid var(--info-color); margin-bottom: 15px;">
            <p style="color: var(--text-secondary); font-size: 0.9em; margin-bottom: 5px;">SKS Tersisa</p>
            <p style="color: var(--info-color); font-size: 1.3em; font-weight: bold;">${remainingSks.toFixed(0)} SKS</p>
        </div>
        
        <div style="background: rgba(0, 0, 0, 0.2); padding: 12px; border-radius: 6px; border-left: 4px solid var(--primary-color); margin-bottom: 15px;">
            <p style="color: var(--text-secondary); font-size: 0.9em; margin-bottom: 5px;">Total Mutu yang Diperlukan</p>
            <p style="color: var(--primary-color); font-size: 1.3em; font-weight: bold;">${totalGradeNeeded.toFixed(2)}</p>
        </div>
        
        <div style="background: rgba(0, 0, 0, 0.2); padding: 12px; border-radius: 6px; border-left: 4px solid var(--secondary-color); margin-bottom: 15px;">
            <p style="color: var(--text-secondary); font-size: 0.9em; margin-bottom: 5px;">Mutu Per SKS yang Diperlukan (Rata-rata)</p>
            <p style="color: var(--secondary-color); font-size: 1.3em; font-weight: bold;">${requiredGradePerSks.toFixed(2)}</p>
        </div>
        
        <div style="background: rgba(0, 0, 0, 0.2); padding: 12px; border-radius: 6px; border-left: 4px solid var(--info-color); margin-bottom: 15px;">
            <p style="color: var(--text-secondary); font-size: 0.9em; margin-bottom: 5px;">SKS per Semester (${DEFAULT_MIN_SKS_PER_SEMESTER}-${DEFAULT_MAX_SKS_PER_SEMESTER} SKS)</p>
            <p style="color: var(--info-color); font-size: 1.3em; font-weight: bold;">${avgSksPerSemester.toFixed(1)} SKS (Rata-rata)</p>
        </div>
        
        <div style="background: rgba(0, 0, 0, 0.2); padding: 12px; border-radius: 6px; border-left: 4px solid var(--secondary-color); margin-bottom: 15px;">
            <p style="color: var(--text-secondary); font-size: 0.9em; margin-bottom: 5px;">Mutu per Semester (Rata-rata)</p>
            <p style="color: var(--secondary-color); font-size: 1.3em; font-weight: bold;">${requiredGradePerSemester.toFixed(2)}</p>
        </div>
        
        <div style="background: ${statusColor}15; border-left: 4px solid ${statusColor}; padding: 12px; border-radius: 6px; text-align: center;">
            <p style="color: ${statusColor}; font-size: 1.1em; font-weight: bold; margin: 0;">${statusMessage}</p>
        </div>
    `;
    resultDiv.classList.remove('hidden');
}

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
    setTimeout(() => {
        errorDiv.classList.add('hidden');
    }, 4000);
}

function showSuccess(message) {
    const successDiv = document.getElementById('successMessage');
    successDiv.textContent = message;
    successDiv.classList.remove('hidden');
    setTimeout(() => {
        successDiv.classList.add('hidden');
    }, 3000);
}