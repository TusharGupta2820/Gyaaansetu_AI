import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import fs from "node:fs";
import path from "node:path";

// Authenticates User and returns user data
export const loginUser = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      email: z.string().email(),
      password: z.string().min(6),
    })
  )
  .handler(async ({ data }) => {
    const { email, password } = data;
    const safeId = email.replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase();

    // Verify if database file exists
    const dbDir = path.resolve(process.cwd(), "db_users");
    const dbPath = path.join(dbDir, `user_${safeId}.db`);
    if (!fs.existsSync(dbPath)) {
      throw new Error("Invalid email or password.");
    }

    const { getDbForUser, hashPassword } = await import("../db.server");
    const userDb = getDbForUser(safeId);
    const stmt = userDb.prepare("SELECT * FROM users WHERE email = ?");
    const user = stmt.get(email) as any;

    if (!user) {
      throw new Error("Invalid email or password.");
    }

    const computedHash = hashPassword(password, user.salt);
    if (computedHash !== user.password_hash) {
      throw new Error("Invalid email or password.");
    }

    return {
      id: safeId,
      email: user.email,
      name: user.name,
    };
  });

// Registers a new user and populates baseline database data
export const registerUser = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      email: z.string().email(),
      name: z.string().min(2),
      password: z.string().min(6),
    })
  )
  .handler(async ({ data }) => {
    const { email, name, password } = data;
    const safeId = email.replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase();

    // Check if user already exists by database file existence
    const dbDir = path.resolve(process.cwd(), "db_users");
    const dbPath = path.join(dbDir, `user_${safeId}.db`);
    if (fs.existsSync(dbPath)) {
      throw new Error("Email already registered.");
    }

    const { getDbForUser, hashPassword, generateSalt } = await import("../db.server");
    const userDb = getDbForUser(safeId);
    const salt = generateSalt();
    const passwordHash = hashPassword(password, salt);

    // 1. Insert User
    userDb.prepare(`
      INSERT INTO users (id, email, name, password_hash, salt)
      VALUES (?, ?, ?, ?, ?)
    `).run(safeId, email, name, passwordHash, salt);

    // 2. Initialize Stats
    userDb.prepare(`
      INSERT INTO user_stats (user_id, study_hours, courses_done, ai_sessions, global_rank, mastery_score, streak_days)
      VALUES (?, 0.0, 0, 0, 999, 0, 0)
    `).run(safeId);

    // 3. Initialize baseline Courses (Clean / 0% Progress)
    const insertCourse = userDb.prepare(`
      INSERT INTO courses (id, user_id, title, desc, tag, progress, hours, syllabus_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    insertCourse.run(
      "react-" + safeId,
      safeId,
      "Advanced React Patterns",
      "Master compound components, headless UI, and server components in depth.",
      "0% done",
      0,
      "12 hours total",
      JSON.stringify(["Compound Components", "Higher-Order Functions", "Render Props", "Server Component Hydration"])
    );

    insertCourse.run(
      "dsa-" + safeId,
      safeId,
      "Data Structures & Algorithms",
      "350+ curated problems with AI-powered hints when you're stuck.",
      "Core",
      0,
      "20 hours total",
      JSON.stringify(["Dynamic Programming", "Graph DFS/BFS traversal", "Trie Index Structs", "Sliding Window Optimization"])
    );

    return {
      id: safeId,
      email: email,
      name: name,
    };
  });
