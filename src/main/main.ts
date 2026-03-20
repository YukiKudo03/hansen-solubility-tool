/**
 * Electronメインプロセス
 */
import { app, BrowserWindow } from 'electron';
import path from 'path';
import Database from 'better-sqlite3';
import { initializeDatabase, migrateDatabase } from '../db/schema';
import { seedDatabase } from '../db/seed-data';
import { SqlitePartsRepository, SqliteSolventRepository, SqliteSettingsRepository, SqliteNanoParticleRepository, SqliteDrugRepository, SqliteDispersantRepository } from '../db/sqlite-repository';
import { SqliteBookmarkRepository } from '../db/bookmark-repository';
import { SqliteHistoryRepository } from '../db/history-repository';
import { seedNanoParticles } from '../db/seed-nano-particles';
import { seedDrugs } from '../db/seed-drugs';
import { seedCoatings } from '../db/seed-coatings';
import { seedPlasticizers } from '../db/seed-plasticizers';
import { seedCarriers } from '../db/seed-carriers';
import { seedDispersants } from '../db/seed-dispersants';
import { registerIpcHandlers } from './ipc-handlers';
import { autoUpdater } from 'electron-updater';

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

  // ナノ粒子シードデータ投入
  seedNanoParticles(db);

  // 薬物シードデータ投入
  seedDrugs(db);

  // コーティング材料シードデータ投入
  seedCoatings(db);

  // 可塑剤シードデータ投入
  seedPlasticizers(db);

  // DDSキャリアシードデータ投入
  seedCarriers(db);

  // 分散剤シードデータ投入
  seedDispersants(db);

  return db;
}

function createWindow(db: Database.Database): void {
  mainWindow = new BrowserWindow({
    width: 960,
    height: 680,
    minWidth: 700,
    minHeight: 500,
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
  const nanoParticleRepo = new SqliteNanoParticleRepository(db);
  const drugRepo = new SqliteDrugRepository(db);
  const dispersantRepo = new SqliteDispersantRepository(db);
  const bookmarkRepo = new SqliteBookmarkRepository(db);
  const historyRepo = new SqliteHistoryRepository(db);
  registerIpcHandlers(partsRepo, solventRepo, settingsRepo, nanoParticleRepo, drugRepo, bookmarkRepo, historyRepo, dispersantRepo);

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

  // 自動アップデート（パッケージビルド時のみ有効）
  if (!process.env.VITE_DEV_SERVER_URL) {
    autoUpdater.autoDownload = true;
    autoUpdater.autoInstallOnAppQuit = true;
    autoUpdater.checkForUpdatesAndNotify();
  }

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
