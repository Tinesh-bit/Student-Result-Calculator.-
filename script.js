
const form = document.getElementById("resultForm");

const subjectNames = [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Programming",
    "English"
];

const subjectColors = [
    "#8b5cf6",
    "#3b82f6",
    "#ec4899",
    "#f97316",
    "#10b981"
];

const resultContent = document.getElementById("resultContent");
const emptyState = document.getElementById("emptyState");
const formMessage = document.getElementById("formMessage");

let currentMarks = [];

// FORM SUBMISSION
form.addEventListener("submit", function (event) {
    event.preventDefault();

    const studentName = document.getElementById("studentName").value.trim();
    const rollNumber = document.getElementById("rollNumber").value.trim();

    currentMarks = [];

    for (let i = 1; i <= 5; i++) {
        const input = document.getElementById("subject" + i);
        const value = input.value.trim();

        if (value === "") {
            showError("Please enter marks for all subjects.");
            return;
        }

        const marks = Number(value);

        if (!Number.isFinite(marks) || marks < 0 || marks > 100) {
            showError("Marks must be between 0 and 100.");
            return;
        }

        currentMarks.push(marks);
    }

    if (studentName === "" || rollNumber === "") {
        showError("Please enter student name and roll number.");
        return;
    }

    formMessage.textContent = "";

    calculateResult(studentName, rollNumber, currentMarks);
});


// ERROR MESSAGE
function showError(message) {
    formMessage.textContent = message;
}


// CALCULATE RESULT
function calculateResult(name, roll, marks) {

    const total = marks.reduce((sum, mark) => sum + mark, 0);

    const percentage = (total / 500) * 100;

    const average = total / marks.length;

    const passedSubjects = marks.filter(mark => mark >= 35).length;

    const isPassed = marks.every(mark => mark >= 35);

    const grade = calculateGrade(percentage, isPassed);

    // STUDENT INFORMATION
    document.getElementById("resultName").textContent = name;

    document.getElementById("resultRoll").textContent =
        "Roll Number: " + roll;

    // RESULT SUMMARY
    document.getElementById("totalMarks").textContent =
        total + " / 500";

    document.getElementById("percentage").textContent =
        percentage.toFixed(2) + "%";

    document.getElementById("average").textContent =
        average.toFixed(2);

    document.getElementById("grade").textContent = grade;

    // PASS / FAIL
    const statusBadge = document.getElementById("statusBadge");

    if (isPassed) {
        statusBadge.textContent = "PASS";
        statusBadge.classList.remove("fail");
    } else {
        statusBadge.textContent = "FAIL";
        statusBadge.classList.add("fail");
    }

    // DISPLAY RESULT
    emptyState.classList.add("hidden");
    resultContent.classList.remove("hidden");

    // OTHER FEATURES
    displaySubjectResults(marks);

    drawBarChart(marks);

    drawRadarChart(marks);

    displayInsights(marks, percentage, grade, passedSubjects, isPassed);

    document.getElementById("resultPanel").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


// GRADE CALCULATION
function calculateGrade(percentage, isPassed) {

    if (!isPassed) {
        return "F";
    }

    if (percentage >= 90) {
        return "A+";
    } else if (percentage >= 80) {
        return "A";
    } else if (percentage >= 70) {
        return "B+";
    } else if (percentage >= 60) {
        return "B";
    } else if (percentage >= 50) {
        return "C";
    } else if (percentage >= 35) {
        return "D";
    } else {
        return "F";
    }
}


// SUBJECT RESULTS
function displaySubjectResults(marks) {

    const subjectResults = document.getElementById("subjectResults");

    subjectResults.innerHTML = "";

    marks.forEach((mark, index) => {

        const subject = document.createElement("div");
        subject.className = "subject-result";

        const subjectName = document.createElement("span");
        subjectName.className = "subject-name";
        subjectName.textContent = subjectNames[index];

        const progressTrack = document.createElement("div");
        progressTrack.className = "progress-track";

        const progressFill = document.createElement("div");
        progressFill.className = "progress-fill";

        progressFill.style.background = subjectColors[index];

        progressTrack.appendChild(progressFill);

        const subjectScore = document.createElement("span");
        subjectScore.className = "subject-score";
        subjectScore.textContent = mark + "/100";

        subject.appendChild(subjectName);
        subject.appendChild(progressTrack);
        subject.appendChild(subjectScore);

        subjectResults.appendChild(subject);

        requestAnimationFrame(() => {
            progressFill.style.width = mark + "%";
        });
    });
}


// BAR CHART
function drawBarChart(marks) {

    const canvas = document.getElementById("performanceChart");

    const ctx = canvas.getContext("2d");

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    const padding = 35;
    const chartHeight = height - 75;
    const chartWidth = width - padding * 2;

    // GRID LINES
    ctx.strokeStyle = "#e9e5f5";
    ctx.lineWidth = 1;

    for (let i = 0; i <= 100; i += 20) {

        const y = height - 45 - (i / 100) * chartHeight;

        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();

        ctx.fillStyle = "#94a3b8";
        ctx.font = "10px Poppins, sans-serif";
        ctx.textAlign = "left";

        ctx.fillText(i, 5, y + 4);
    }

    const barWidth = chartWidth / marks.length;

    marks.forEach((mark, index) => {

        const barHeight = (mark / 100) * chartHeight;

        const x = padding + index * barWidth + barWidth * 0.2;

        const y = height - 45 - barHeight;

        const actualWidth = barWidth * 0.6;

        const gradient = ctx.createLinearGradient(
            0, y, 0, height - 45
        );

        gradient.addColorStop(0, subjectColors[index]);
        gradient.addColorStop(1, subjectColors[index] + "55");

        ctx.fillStyle = gradient;

        drawRoundedRect(
            ctx,
            x,
            y,
            actualWidth,
            barHeight,
            8
        );

        // MARKS LABEL
        ctx.fillStyle = "#334155";
        ctx.font = "bold 12px Poppins, sans-serif";
        ctx.textAlign = "center";

        ctx.fillText(
            mark,
            x + actualWidth / 2,
            y - 8
        );

        // SUBJECT LABEL
        ctx.fillStyle = "#64748b";
        ctx.font = "10px Poppins, sans-serif";

        ctx.fillText(
            subjectNames[index],
            x + actualWidth / 2,
            height - 15
        );
    });
}


// ROUNDED RECTANGLE
function drawRoundedRect(ctx, x, y, width, height, radius) {

    if (height <= 0) return;

    radius = Math.min(radius, width / 2, height / 2);

    ctx.beginPath();

    ctx.moveTo(x + radius, y);

    ctx.lineTo(x + width - radius, y);

    ctx.quadraticCurveTo(
        x + width, y,
        x + width, y + radius
    );

    ctx.lineTo(x + width, y + height - radius);

    ctx.quadraticCurveTo(
        x + width, y + height,
        x + width - radius, y + height
    );

    ctx.lineTo(x + radius, y + height);

    ctx.quadraticCurveTo(
        x, y + height,
        x, y + height - radius
    );

    ctx.lineTo(x, y + radius);

    ctx.quadraticCurveTo(
        x, y,
        x + radius, y
    );

    ctx.closePath();

    ctx.fill();
}


// RADAR CHART
function drawRadarChart(marks) {

    const canvas = document.getElementById("radarChart");

    const ctx = canvas.getContext("2d");

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;

    const radius = Math.min(width, height) * 0.32;

    const sides = marks.length;

    // RADAR GRID
    for (let level = 1; level <= 5; level++) {

        const currentRadius = radius * (level / 5);

        ctx.beginPath();

        for (let i = 0; i < sides; i++) {

            const angle =
                (Math.PI * 2 * i / sides) - Math.PI / 2;

            const x =
                centerX + Math.cos(angle) * currentRadius;

            const y =
                centerY + Math.sin(angle) * currentRadius;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }

        ctx.closePath();

        ctx.strokeStyle = "#e9e5f5";
        ctx.stroke();
    }

    // RADAR AXES
    for (let i = 0; i < sides; i++) {

        const angle =
            (Math.PI * 2 * i / sides) - Math.PI / 2;

        ctx.beginPath();

        ctx.moveTo(centerX, centerY);

        ctx.lineTo(
            centerX + Math.cos(angle) * radius,
            centerY + Math.sin(angle) * radius
        );

        ctx.strokeStyle = "#ddd6fe";

        ctx.stroke();
    }

    // DATA AREA
    ctx.beginPath();

    marks.forEach((mark, index) => {

        const angle =
            (Math.PI * 2 * index / sides) - Math.PI / 2;

        const pointRadius = radius * (mark / 100);

        const x =
            centerX + Math.cos(angle) * pointRadius;

        const y =
            centerY + Math.sin(angle) * pointRadius;

        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });

    ctx.closePath();

    ctx.fillStyle = "rgba(139, 92, 246, 0.20)";
    ctx.fill();

    ctx.strokeStyle = "#8b5cf6";
    ctx.lineWidth = 2;

    ctx.stroke();

    // POINTS AND LABELS
    marks.forEach((mark, index) => {

        const angle =
            (Math.PI * 2 * index / sides) - Math.PI / 2;

        const pointRadius = radius * (mark / 100);

        const x =
            centerX + Math.cos(angle) * pointRadius;

        const y =
            centerY + Math.sin(angle) * pointRadius;

        ctx.beginPath();

        ctx.arc(x, y, 5, 0, Math.PI * 2);

        ctx.fillStyle = subjectColors[index];

        ctx.fill();

        // LABEL POSITION
        const labelRadius = radius + 30;

        const labelX =
            centerX + Math.cos(angle) * labelRadius;

        const labelY =
            centerY + Math.sin(angle) * labelRadius;

        ctx.fillStyle = "#475569";

        ctx.font = "10px Poppins, sans-serif";

        ctx.textAlign = "center";

        ctx.textBaseline = "middle";

        ctx.fillText(
            subjectNames[index],
            labelX,
            labelY
        );
    });
}


// PERFORMANCE INSIGHTS
function displayInsights(
    marks,
    percentage,
    grade,
    passedSubjects,
    isPassed
) {

    const insightsContent =
        document.getElementById("insightsContent");

    insightsContent.innerHTML = "";

    const highestMark = Math.max(...marks);

    const lowestMark = Math.min(...marks);

    const highestIndex = marks.indexOf(highestMark);

    const lowestIndex = marks.indexOf(lowestMark);

    const insights = [

        {
            title: "🏆 Strongest Subject",
            message:
                subjectNames[highestIndex] +
                " is your strongest subject with " +
                highestMark +
                " marks."
        },

        {
            title: "📌 Improvement Area",
            message:
                subjectNames[lowestIndex] +
                " has " +
                lowestMark +
                " marks. Focus on improving this subject."
        },

        {
            title: "🎯 Overall Performance",
            message:
                "Your percentage is " +
                percentage.toFixed(2) +
                "% and your final grade is " +
                grade +
                "."
        },

        {
            title: "📚 Academic Status",
            message:
                isPassed
                    ? "Congratulations! You passed all 5 subjects."
                    : "You passed " +
                      passedSubjects +
                      " out of 5 subjects. Keep practicing."
        }
    ];

    insights.forEach(insight => {

        const card = document.createElement("div");

        card.className = "insight-card";

        const title = document.createElement("h3");

        title.textContent = insight.title;

        const message = document.createElement("p");

        message.textContent = insight.message;

        card.appendChild(title);

        card.appendChild(message);

        insightsContent.appendChild(card);
    });
}


// PRINT RESULT
document.getElementById("printButton").addEventListener(
    "click",
    function () {
        window.print();
    }
);


// REDRAW CHARTS ON RESIZE
window.addEventListener("resize", function () {

    if (!resultContent.classList.contains("hidden")) {

        drawBarChart(currentMarks);

        drawRadarChart(currentMarks);
    }
});
