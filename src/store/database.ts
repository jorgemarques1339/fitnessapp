import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import { CompletedWorkout } from './types';

const isWeb = Platform.OS === 'web';

const DB_NAME = 'fitness_history.db';

export async function initDatabase() {
  if (isWeb) return null;
  const db = await SQLite.openDatabaseAsync(DB_NAME);

  // Create table for completed workouts
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS completed_workouts (
      id TEXT PRIMARY KEY NOT NULL,
      date TEXT NOT NULL,
      routineId TEXT,
      routineTitle TEXT,
      durationMs INTEGER,
      totalTonnageKg REAL,
      totalSets INTEGER,
      workoutData TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_workout_date ON completed_workouts(date);
  `);

  return db;
}

export async function getCompletedWorkoutsFromDB(): Promise<CompletedWorkout[]> {
  if (isWeb) return [];
  const db = await SQLite.openDatabaseAsync(DB_NAME);
  const allRows = await db.getAllAsync<{ workoutData: string }>('SELECT workoutData FROM completed_workouts ORDER BY date DESC');
  return allRows.map(row => JSON.parse(row.workoutData));
}

export async function saveWorkoutToDB(workout: CompletedWorkout) {
  if (isWeb) return;
  const db = await SQLite.openDatabaseAsync(DB_NAME);
  await db.runAsync(
    `INSERT OR REPLACE INTO completed_workouts (id, date, routineId, routineTitle, durationMs, totalTonnageKg, totalSets, workoutData) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      workout.id,
      workout.date,
      workout.routineId || null,
      workout.routineTitle,
      workout.durationMs || 0,
      workout.totalTonnageKg || 0,
      workout.totalSets || 0,
      JSON.stringify(workout)
    ]
  );
}

export async function deleteWorkoutFromDB(id: string) {
  if (isWeb) return;
  const db = await SQLite.openDatabaseAsync(DB_NAME);
  await db.runAsync('DELETE FROM completed_workouts WHERE id = ?', [id]);
}

export async function clearAllWorkoutsFromDB() {
  if (isWeb) return;
  const db = await SQLite.openDatabaseAsync(DB_NAME);
  await db.runAsync('DELETE FROM completed_workouts');
}
