
// Micro-Habit Quest — Hauptlogik und Ablauf

const INITIAL_STATE = {
     // Standard User Daten beim neuladen oder reseten
    user: {
        name: "Held des Alltags",
        level: 1,
        xp: 0,
        xpToNextLevel: 100,
        totalXP: 0,
        bestStreak: 0
    },
    habits: [
         // Standard Habits beim neuladen oder reseten
        {
            id: "1",
            title: "30 Min. Programmieren",
            desc: "Ein ausgewähltes Modul durcharbeiten oder LeetCode lösen",
            xp: 20,
            icon: "💻",
            completedToday: false,
            streak: 3
        },
        {
            id: "2",
            title: "2 Liter Wasser trinken",
            desc: "Ausreichend Hydratation über den Tag verteilt",
            xp: 10,
            icon: "💧",
            completedToday: false,
            streak: 5
        }
    ],
    // alle Badges sind hier aufgelistet
    badges: [
        { id: 'b1', title: 'Erster Schritt', desc: 'Schließe deine erste Quest ab', icon: '🚀', unlocked: false },
        { id: 'b2', title: 'Gewohnheitstier', desc: 'Erreiche einen 3-Tage-Streak', icon: '🔥', unlocked: false },
        { id: 'b3', title: 'Aufsteiger', desc: 'Erreiche Level 2', icon: '⭐', unlocked: false },
        { id: 'b4', title: 'Code Meister', desc: 'Schließe 10 Quests ab', icon: '💻', unlocked: false },
        { id: 'b5', title: 'Routine-König', desc: 'Sammle 200 XP', icon: '💎', unlocked: false },
        { id: 'b6', title: 'Unaufhaltsam', desc: 'Erreiche einen 7-Tage-Streak', icon: '👑', unlocked: false }
    ],
    stats: {
        completedCount: 0
    }
};

let state = JSON.parse(localStorage.getItem('micro_habit_quest_state')) || INITIAL_STATE;

// Sicherung zum State to LocalStorage
function saveState() {
    localStorage.setItem('micro_habit_quest_state', JSON.stringify(state));
    renderApp();
}

// Render Functions
function renderApp() {
    // Render Profile & XP
    document.getElementById('userName').textContent = state.user.name;
    document.getElementById('userLevel').textContent = `Lvl ${state.user.level}`;
    document.getElementById('userLevel').textContent = `Lvl ${state.user.level}`;
    document.getElementById('xpText').textContent = `${state.user.xp} / ${state.user.xpToNextLevel} XP`;
    
    const xpPercent = Math.min((state.user.xp / state.user.xpToNextLevel) * 100, 100);
    document.getElementById('xpBar').style.width = `${xpPercent}%`;
    
    document.getElementById('totalXP').textContent = `${state.user.totalXP} XP`;
    document.getElementById('totalStreak').textContent = `${state.user.bestStreak} Tage`;

    // Render Stats Tab
    document.getElementById('statCompletedCount').textContent = state.stats.completedCount;
    document.getElementById('statCurrentLevel').textContent = state.user.level;
    
    const unlockedBadgesCount = state.badges.filter(b => b.unlocked).length;
    document.getElementById('statBadgeCount').textContent = `${unlockedBadgesCount} / ${state.badges.length}`;

    // Render Habits
    renderHabits();
    
    // Render Badges
    renderBadges();
}

function renderHabits() {
    const habitsList = document.getElementById('habitsList');
    habitsList.innerHTML = '';

    if (state.habits.length === 0) {
        habitsList.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px;">Keine Quests vorhanden. Erstelle deine erste Quest oben!</p>`;
        return;
    }

    state.habits.forEach(habit => {
        const card = document.createElement('div');
        card.className = `habit-card ${habit.completedToday ? 'completed' : ''}`;
        card.innerHTML = `
            <div>
                <div class="habit-header">
                    <div class="habit-icon-box">${habit.icon}</div>
                    <div class="habit-details">
                        <h4>${escapeHtml(habit.title)}</h4>
                        <p>${escapeHtml(habit.desc || '')}</p>
                    </div>
                </div>
                <div class="habit-tags">
                    <span class="tag tag-xp">+${habit.xp} XP</span>
                    <span class="tag tag-streak">🔥 ${habit.streak} Tage Streak</span>
                </div>
            </div>
            <div class="habit-footer">
                <button class="check-btn" onclick="toggleHabit('${habit.id}')">
                    ${habit.completedToday ? '✓ Abgeschlossen' : 'Quest Erledigen'}
                </button>
                <button class="delete-habit-btn" onclick="deleteHabit('${habit.id}')" title="Quest löschen">&times;</button>
            </div>
        `;
        habitsList.appendChild(card);
    });
}

function renderBadges() {
    const badgesList = document.getElementById('badgesList');
    badgesList.innerHTML = '';

    state.badges.forEach(badge => {
        const card = document.createElement('div');
        card.className = `badge-card ${badge.unlocked ? 'unlocked' : ''}`;
        card.innerHTML = `
            <div class="badge-icon">${badge.icon}</div>
            <h4>${badge.title}</h4>
            <p>${badge.desc}</p>
        `;
        badgesList.appendChild(card);
    });
}

// Actions
function toggleHabit(id) {
    const habit = state.habits.find(h => h.id === id);
    if (!habit) return;

    if (!habit.completedToday) {
        // Complete Habit
        habit.completedToday = true;
        habit.streak += 1;
        state.stats.completedCount += 1;
        
        // Update Best Streak
        if (habit.streak > state.user.bestStreak) {
            state.user.bestStreak = habit.streak;
        }

        // Add XP
        addXP(habit.xp);
        showToast(`Herzlichen Glückwunsch!`);
        showToast(`✨ Quest erledigt! +${habit.xp} XP erhalten.`);
        launchConfetti()

    } else {
        // Undo Completion
        habit.completedToday = false;
        habit.streak = Math.max(0, habit.streak - 1);
        state.stats.completedCount = Math.max(0, state.stats.completedCount - 1);
        showToast(`↺ Quest-Status zurückgesetzt.`);
    }

    checkBadgeTriggers();
    saveState();
}

function launchConfetti() {

    const container = document.createElement("div");
    container.className = "confetti-container";
    document.body.appendChild(container);

    const colors = [
        "#ff4d4d",
        "#ffd93d",
        "#6bcb77",
        "#4d96ff",
        "#c77dff",
        "#ff8fab",
        "#00c2a8"
    ];

    for (let i = 0; i < 80; i++) {

        const piece = document.createElement("span");
        piece.className = "confetti";

        piece.style.left = Math.random() * 100 + "vw";
        piece.style.background = colors[Math.floor(Math.random() * colors.length)];
        piece.style.animationDuration = (2 + Math.random() * 2) + "s";
        piece.style.animationDelay = (Math.random() * 0.5) + "s";
        piece.style.transform = `rotate(${Math.random()*360}deg)`;

        container.appendChild(piece);
    }

    setTimeout(() => {
        container.remove();
    }, 4500);
}

function addXP(amount) {
    state.user.xp += amount;
    state.user.totalXP += amount;

    // Check Level Up
    if (state.user.xp >= state.user.xpToNextLevel) {
        state.user.xp -= state.user.xpToNextLevel;
        state.user.level += 1;
        state.user.xpToNextLevel = Math.round(state.user.xpToNextLevel * 1.3); // Scale XP requirement
        showToast(`🎉 LEVEL UP! Du bist jetzt Level ${state.user.level}!`, 'gold');
    }
}

function checkBadgeTriggers() {
    // B1: Erster Schritt
    if (state.stats.completedCount >= 1 && !state.badges[0].unlocked) {
        unlockBadge('b1');
    }
    // B2: Gewohnheitstier (3-Tage-Streak)
    if (state.user.bestStreak >= 3 && !state.badges[1].unlocked) {
        unlockBadge('b2');
    }
    // B3: Aufsteiger (Level 2)
    if (state.user.level >= 2 && !state.badges[2].unlocked) {
        unlockBadge('b3');
    }
    // B4: Code Meister (10 abgeschlossene Quests)
    if (state.stats.completedCount >= 10 && state.badges[3] && !state.badges[3].unlocked) {
        unlockBadge('b4');
    }
    // B5: Routine-König (200 total XP)
    if (state.user.totalXP >= 200 && !state.badges[4].unlocked) {
        unlockBadge('b5');
    }
    // B6: Unaufhaltsam (7-Tage-Streak)
    if (state.user.bestStreak >= 7 && !state.badges[5].unlocked) {
        unlockBadge('b6');
    }
}

function unlockBadge(id) {
    const badge = state.badges.find(b => b.id === id);
    if (badge && !badge.unlocked) {
        badge.unlocked = true;
        showToast(`🏆 NEUER ERFOLG: "${badge.title}" freigeschaltet!`);
    }
}

function deleteHabit(id) {
    state.habits = state.habits.filter(h => h.id !== id);
    saveState();
}

// UI Helpers
function showToast(message) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3500);
}

function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Event Listeners Initialization
document.addEventListener('DOMContentLoaded', () => {
    renderApp();

    // Navigation Tabs
    const navBtns = document.querySelectorAll('.nav-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            
            navBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // Modal Control
    const modal = document.getElementById('habitModal');
    const openBtn = document.getElementById('openHabitModalBtn');
    const closeBtn = document.getElementById('closeHabitModalBtn');
    const cancelBtn = document.getElementById('cancelModalBtn');
    const form = document.getElementById('habitForm');

    openBtn.onclick = () => modal.classList.add('active');
    closeBtn.onclick = () => modal.classList.remove('active');
    cancelBtn.onclick = () => modal.classList.remove('active');

    form.onsubmit = (e) => {
        e.preventDefault();
        const title = document.getElementById('habitTitle').value;
        const desc = document.getElementById('habitDesc').value;
        const xp = parseInt(document.getElementById('habitDifficulty').value);
        const icon = document.getElementById('habitIcon').value;

        const newHabit = {
            id: Date.now().toString(),
            title,
            desc,
            xp,
            icon,
            completedToday: false,
            streak: 0
        };

        state.habits.push(newHabit);
        saveState();

        form.reset();
        modal.classList.remove('active');
        showToast('✨ Neue Quest hinzugefügt!');
    };

    // Reset Button
    document.getElementById('resetDataBtn').onclick = () => {
        if (confirm('Möchtest du wirklich alle Fortschritte und Gewohnheiten zurücksetzen?')) {
            localStorage.removeItem('micro_habit_quest_state');
            state = JSON.parse(JSON.stringify(INITIAL_STATE));
            saveState();
            showToast('🔄 Daten zurückgesetzt.');
        }
    };
});
