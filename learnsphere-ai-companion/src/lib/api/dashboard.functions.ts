import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { db, generateUUID } from "../db.server";

// Loads stats, profile, and tasks for a given user
export const loadDashboardData = createServerFn({ method: "GET" })
  .inputValidator(z.object({ userId: z.string() }))
  .handler(async ({ data }) => {
    const { userId } = data;

    // 1. Fetch Stats
    const statsStmt = db.prepare("SELECT * FROM user_stats WHERE user_id = ?");
    let stats = statsStmt.get(userId) as any;

    if (!stats) {
      // Create if missing
      db.prepare(`
        INSERT INTO user_stats (user_id, study_hours, courses_done, ai_sessions, global_rank, mastery_score, streak_days)
        VALUES (?, 0.0, 0, 0, 999, 0, 0)
      `).run(userId);
      stats = statsStmt.get(userId) as any;
    }

    // 2. Fetch User Profile
    const userStmt = db.prepare("SELECT * FROM users WHERE id = ?");
    let user = userStmt.get(userId) as any;
    if (!user) {
      db.prepare(`
        INSERT INTO users (id, email, name, password_hash, salt)
        VALUES (?, ?, ?, '', '')
      `).run(userId, `${userId}@gyaansetu.ai`, userId.charAt(0).toUpperCase() + userId.slice(1));
      user = userStmt.get(userId) as any;
    }

    // 3. Fetch Tasks
    const tasksStmt = db.prepare("SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC");
    const tasks = tasksStmt.all(userId) as any[];

    // 4. Fetch Deadlines
    const deadlinesStmt = db.prepare("SELECT * FROM timetable_deadlines WHERE user_id = ? AND completed = 0 ORDER BY due_at ASC");
    const deadlines = deadlinesStmt.all(userId) as any[];

    return {
      stats: {
        studyHours: stats.study_hours,
        coursesDone: stats.courses_done,
        aiSessions: stats.ai_sessions,
        globalRank: stats.global_rank,
        masteryScore: stats.mastery_score,
        streakDays: stats.streak_days,
      },
      profile: {
        name: user.name || "",
        educationLevel: user.education_level || "Undergraduate",
        learningGoal: user.learning_goal || "Master CS foundations",
        preferredLang: user.preferred_lang || "English",
        careerTarget: user.career_target || "Software Engineer",
        branch: user.branch || "Computer Science",
        semester: user.semester || "Semester 1",
        weakTopics: JSON.parse(user.weak_topics || "[]"),
        strongTopics: JSON.parse(user.strong_topics || "[]"),
        learningStyle: user.learning_style || "Visual",
        dailyStudyHours: user.daily_study_hours || 2.0,
        currentSubject: user.current_subject || "",
        currentChapter: user.current_chapter || "",
        explanationStyle: user.explanation_style || "Deep Learning",
        recentQuizScore: user.recent_quiz_score || 0.0,
        persona: user.persona || "Academy Teacher",
      },
      tasks: tasks.map((t) => ({
        id: t.id,
        text: t.text,
        completed: t.completed === 1,
      })),
      deadlines: deadlines.map((d) => ({
        id: d.id,
        title: d.title,
        dueAt: d.due_at,
        category: d.category,
        priority: d.priority,
        reminderIntervalMins: d.reminder_interval_mins,
        completed: d.completed === 1,
      })),
    };
  });

// Update user profile fields
export const updateUserProfile = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      userId: z.string(),
      name: z.string().optional(),
      educationLevel: z.string().optional(),
      learningGoal: z.string().optional(),
      preferredLang: z.string().optional(),
      careerTarget: z.string().optional(),
      branch: z.string().optional(),
      semester: z.string().optional(),
      weakTopics: z.array(z.string()).optional(),
      strongTopics: z.array(z.string()).optional(),
      learningStyle: z.string().optional(),
      dailyStudyHours: z.number().optional(),
      currentSubject: z.string().optional(),
      currentChapter: z.string().optional(),
      explanationStyle: z.string().optional(),
      recentQuizScore: z.number().optional(),
      persona: z.string().optional(),
    })
  )
  .handler(async ({ data }) => {
    const { userId, ...fields } = data;

    const setClauses: string[] = [];
    const params: any[] = [];

    // Map camelCase fields to snake_case DB columns
    const mappings: Record<string, string> = {
      name: "name",
      educationLevel: "education_level",
      learningGoal: "learning_goal",
      preferredLang: "preferred_lang",
      careerTarget: "career_target",
      branch: "branch",
      semester: "semester",
      weakTopics: "weak_topics",
      strongTopics: "strong_topics",
      learningStyle: "learning_style",
      dailyStudyHours: "daily_study_hours",
      currentSubject: "current_subject",
      currentChapter: "current_chapter",
      explanationStyle: "explanation_style",
      recentQuizScore: "recent_quiz_score",
      persona: "persona",
    };

    for (const [key, val] of Object.entries(fields)) {
      if (val !== undefined && mappings[key]) {
        setClauses.push(`${mappings[key]} = ?`);
        if (Array.isArray(val)) {
          params.push(JSON.stringify(val));
        } else {
          params.push(val);
        }
      }
    }

    if (setClauses.length > 0) {
      params.push(userId);
      db.prepare(`
        UPDATE users
        SET ${setClauses.join(", ")}
        WHERE id = ?
      `).run(...params);
    }

    return { success: true };
  });

// Add deadline/timetable event
export const addDeadline = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      userId: z.string(),
      title: z.string().min(1),
      dueAt: z.string(),
      category: z.string().optional(),
      priority: z.string().optional(),
      reminderIntervalMins: z.number().optional(),
    })
  )
  .handler(async ({ data }) => {
    const { userId, title, dueAt, category = "assignment", priority = "Medium", reminderIntervalMins = 30 } = data;
    const id = generateUUID();

    db.prepare(`
      INSERT INTO timetable_deadlines (id, user_id, title, due_at, category, priority, reminder_interval_mins, completed)
      VALUES (?, ?, ?, ?, ?, ?, ?, 0)
    `).run(id, userId, title, dueAt, category, priority, reminderIntervalMins);

    return { id, title, dueAt, category, priority, reminderIntervalMins, completed: false };
  });

// Toggle deadline
export const toggleDeadline = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string(), completed: z.boolean() }))
  .handler(async ({ data }) => {
    const { id, completed } = data;
    db.prepare("UPDATE timetable_deadlines SET completed = ? WHERE id = ?").run(completed ? 1 : 0, id);
    return { id, completed };
  });

// Adds a task
export const addTask = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      userId: z.string(),
      text: z.string().min(1),
    })
  )
  .handler(async ({ data }) => {
    const { userId, text } = data;
    const id = generateUUID();

    db.prepare(`
      INSERT INTO tasks (id, user_id, text, completed)
      VALUES (?, ?, ?, 0)
    `).run(id, userId, text);

    return { id, text, completed: false };
  });

// Toggles completion status of a task
export const toggleTask = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      id: z.string(),
      completed: z.boolean(),
    })
  )
  .handler(async ({ data }) => {
    const { id, completed } = data;

    db.prepare(`
      UPDATE tasks SET completed = ? WHERE id = ?
    `).run(completed ? 1 : 0, id);

    return { id, completed };
  });

// Deletes a task
export const deleteTask = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const { id } = data;
    db.prepare("DELETE FROM tasks WHERE id = ?").run(id);
    return { id };
  });

// Log Pomodoro Completion and update stats
export const completeFocusSession = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      userId: z.string(),
      hoursIncrement: z.number(),
    })
  )
  .handler(async ({ data }) => {
    const { userId, hoursIncrement } = data;

    db.prepare(`
      UPDATE user_stats
      SET study_hours = study_hours + ?,
          streak_days = streak_days + 1
      WHERE user_id = ?
    `).run(hoursIncrement, userId);

    const stats = db.prepare("SELECT * FROM user_stats WHERE user_id = ?").get(userId) as any;
    return {
      studyHours: stats.study_hours,
      streakDays: stats.streak_days,
    };
  });
