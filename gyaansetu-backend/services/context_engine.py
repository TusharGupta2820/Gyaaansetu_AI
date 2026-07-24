"""
GyaanSetu AI — Centralized AI Context & Memory Engine
Aggregates user profile, academic status, study stats, weak topics (mistakes), and deadlines into a rich prompt context.
"""

import logging
from db.database import get_connection, current_user_id

logger = logging.getLogger("gyaansetu.context_engine")

async def build_user_context(user_id: str) -> dict:
    """
    Query the user databases and build a dictionary representing the student's current learning state.
    """
    token = current_user_id.set(user_id)
    try:
        conn = get_connection()
        cursor = conn.cursor()

        # 1. Fetch user profile
        cursor.execute(
            """SELECT name, education_level, learning_goal, preferred_lang, career_target, 
                      branch, semester, weak_topics, strong_topics, learning_style, 
                      daily_study_hours, current_subject, current_chapter, explanation_style, 
                      recent_quiz_score, persona FROM users WHERE id = ?""", 
            (user_id,)
        )
        user_row = cursor.fetchone()
        
        # 2. Fetch user stats
        cursor.execute(
            """SELECT study_hours, courses_done, ai_sessions, global_rank, mastery_score, streak_days 
               FROM user_stats WHERE user_id = ?""", 
            (user_id,)
        )
        stats_row = cursor.fetchone()

        # 3. Fetch recent mistakes (weak concepts)
        cursor.execute(
            "SELECT topic, frequency, type FROM mistakes WHERE user_id = ? ORDER BY frequency DESC LIMIT 5",
            (user_id,)
        )
        mistakes = cursor.fetchall()

        # 4. Fetch upcoming deadlines
        cursor.execute(
            "SELECT title, due_at, category, priority FROM timetable_deadlines WHERE user_id = ? AND completed = 0 ORDER BY due_at ASC LIMIT 3",
            (user_id,)
        )
        deadlines = cursor.fetchall()

    except Exception as e:
        logger.error(f"Error fetching learning context for user {user_id}: {e}")
        user_row = None
        stats_row = None
        mistakes = []
        deadlines = []
    finally:
        current_user_id.reset(token)

    # Defaults
    profile = {
        "name": user_id, "education_level": "Undergraduate", "learning_goal": "Master CS foundations",
        "preferred_lang": "English", "career_target": "Software Engineer",
        "branch": "Computer Science", "semester": "Semester 1", "weak_topics": "[]", "strong_topics": "[]",
        "learning_style": "Visual", "daily_study_hours": 2.0, "current_subject": "Coding", "current_chapter": "General",
        "explanation_style": "Deep Learning", "recent_quiz_score": 0.0, "persona": "Academy Teacher"
    }
    stats = {
        "study_hours": 0.0, "courses_done": 0, "ai_sessions": 0, "global_rank": 999, "mastery_score": 0, "streak_days": 0
    }

    if user_row:
        for idx, key in enumerate(profile.keys()):
            if user_row[idx] is not None:
                profile[key] = user_row[idx]

    if stats_row:
        for idx, key in enumerate(stats.keys()):
            if stats_row[idx] is not None:
                stats[key] = stats_row[idx]

    return {
        "profile": profile,
        "stats": stats,
        "mistakes": [{"topic": m[0], "frequency": m[1], "type": m[2]} for m in mistakes],
        "deadlines": [{"title": d[0], "due_at": d[1], "category": d[2], "priority": d[3]} for d in deadlines]
    }


def get_context_prompt_prefix(context: dict) -> str:
    """
    Compiles the dynamic context dictionary into a strict system prompt instruction block.
    """
    profile = context["profile"]
    stats = context["stats"]
    mistakes = context["mistakes"]
    deadlines = context["deadlines"]

    # Formulate list of weak topics
    weak_str = ", ".join([m["topic"] for m in mistakes]) if mistakes else "None logged yet"
    
    # Formulate upcoming deadlines
    deadline_str = ""
    if deadlines:
        deadline_str = "\n".join([f"  - {d['title']} (Due: {d['due_at']}, Priority: {d['priority']})" for d in deadlines])
    else:
        deadline_str = "  - None scheduled"

    system_prefix = (
        f"STUDENT PROFILE:\n"
        f"- Name: {profile['name']}\n"
        f"- Current Subject: {profile['current_subject']} | Chapter: {profile['current_chapter']}\n"
        f"- Class/Semester: {profile['education_level']} ({profile['branch']} - {profile['semester']})\n"
        f"- Study Streak: {stats['streak_days']} days | Daily Goal: {profile['daily_study_hours']} hours (Studied: {stats['study_hours']} hours)\n"
        f"- Career Goal: {profile['career_target']} | General Goal: {profile['learning_goal']}\n"
        f"- Learning Style Preference: {profile['learning_style']} | Mode Preference: {profile['explanation_style']}\n"
        f"- Logged Weak Concepts: {weak_str}\n"
        f"- Upcoming Timetable Deadlines:\n{deadline_str}\n\n"
        f"INSTRUCTION TO AI TUTOR:\n"
        f"1. You are acting under the AI Persona of a/an '{profile['persona']}'. Adopt terminology, depth, explanation style, and tone suitable for a/an '{profile['persona']}'.\n"
        f"2. Adjust your terminology, depth, and tone to suit the student's profile (education level, style, branch, semester).\n"
        f"3. Explicitly tie responses back to their current subject ({profile['current_subject']}) and target career ({profile['career_target']}) where helpful.\n"
        f"4. Incorporate ATL (Approaches to Learning) frameworks (e.g. self-management, thinking skills) and Visual Thinking Routines (e.g. See-Think-Wonder, Connect-Extend-Challenge) where appropriate.\n"
        f"5. If a deadline is highly critical/due shortly, gently remind the user about it in context of their study segment.\n"
    )
    return system_prefix
