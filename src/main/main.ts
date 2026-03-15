/**
 * Electronメインプロセス
 */
import { app, BrowserWindow } from 'electron';
import path from 'path';
import Database from 'better-sqlite3';
import { initializeDatabase, migrateDatabase } from '../db/schema';
import { seedDatabase } from '../db/seed-data';
import { SqlitePartsRepository, SqliteSolventRepository, SqliteSettingsRepository } from '../db/sqlite-repository';
import { registerIpcHandlers } from './ipc-handlers';

let mainWindow: BrowserWindow | null = null;

function getDbPath(): string {
  const userDataPath = app.getPath('userData');
  return path.join(userDataPath, 'hansen.db');
}

function initDb(): Database.Database {
  const dbPath = getDbPath();
  const db = new Database(dbPath);
  initializeDatabase(db);
  migrateDatabase(db);

  // テーブルが空の場合のみシードデータを投入
  const count = db.prepare('SELECT COUNT(*) as cnt FROM solvents').get() as { cnt: number };
  if (count.cnt === 0) {
    seedDatabase(db);
  }

  return db;
}

function createWindow(db: Database.Database): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'Hansen溶解度パラメータ 溶解性評価ツール',
    icon: path.join(__dirname, '../../build/icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  // IPC ハンドラー登録
  const partsRepo = new SqlitePartsRepository(db);
  const solventRepo = new SqliteSolventRepository(db);
  const settingsRepo = new SqliteSettingsRepository(db);
  registerIpcHandlers(partsRepo, solventRepo, settingsRepo);

  // 開発時はVite devサーバー、本番時はビルド済みファイルを読み込む
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  const db = initDb();
  createWindow(db);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow(db);
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
