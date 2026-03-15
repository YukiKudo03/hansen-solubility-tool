/**
 * リポジトリインターフェース定義
 */
import type { Part, PartsGroup, Solvent, RiskThresholds, NanoParticle, NanoParticleCategory, Drug } from '../core/types';

/** 部品グループ作成DTO */
export interface CreatePartsGroupDto {
  name: string;
  description?: string;
}

/** 部品作成DTO */
export interface CreatePartDto {
  groupId: number;
  name: string;
  materialType?: string;
  deltaD: number;
  deltaP: number;
  deltaH: number;
  r0: number;
  notes?: string;
}

/** 溶媒作成DTO */
export interface CreateSolventDto {
  name: string;
  nameEn?: string;
  casNumber?: string;
  deltaD: number;
  deltaP: number;
  deltaH: number;
  molarVolume?: number;
  molWeight?: number;
  boilingPoint?: number;
  viscosity?: number;
  specificGravity?: number;
  surfaceTension?: number;
  notes?: string;
}

export interface PartsRepository {
  getAllGroups(): PartsGroup[];
  getGroupById(id: number): PartsGroup | null;
  createGroup(dto: CreatePartsGroupDto): PartsGroup;
  updateGroup(id: number, dto: Partial<CreatePartsGroupDto>): PartsGroup | null;
  deleteGroup(id: number): boolean;

  getPartsByGroupId(groupId: number): Part[];
  createPart(dto: CreatePartDto): Part;
  updatePart(id: number, dto: Partial<CreatePartDto>): Part | null;
  deletePart(id: number): boolean;
}

export interface SolventRepository {
  getAllSolvents(): Solvent[];
  getSolventById(id: number): Solvent | null;
  searchSolvents(query: string): Solvent[];
  getPlasticizers(): Solvent[];
  createSolvent(dto: CreateSolventDto): Solvent;
  updateSolvent(id: number, dto: Partial<CreateSolventDto>): Solvent | null;
  deleteSolvent(id: number): boolean;
}

/** ナノ粒子作成DTO */
export interface CreateNanoParticleDto {
  name: string;
  nameEn?: string;
  category: NanoParticleCategory;
  coreMaterial: string;
  surfaceLigand?: string;
  deltaD: number;
  deltaP: number;
  deltaH: number;
  r0: number;
  particleSize?: number;
  notes?: string;
}

export interface NanoParticleRepository {
  getAll(): NanoParticle[];
  getById(id: number): NanoParticle | null;
  getByCategory(category: NanoParticleCategory): NanoParticle[];
  search(query: string): NanoParticle[];
  create(dto: CreateNanoParticleDto): NanoParticle;
  update(id: number, dto: Partial<CreateNanoParticleDto>): NanoParticle | null;
  delete(id: number): boolean;
}

/** 薬物作成DTO */
export interface CreateDrugDto {
  name: string;
  nameEn?: string;
  casNumber?: string;
  deltaD: number;
  deltaP: number;
  deltaH: number;
  r0: number;
  molWeight?: number;
  logP?: number;
  therapeuticCategory?: string;
  notes?: string;
}

export interface DrugRepository {
  getAll(): Drug[];
  getById(id: number): Drug | null;
  getByTherapeuticCategory(category: string): Drug[];
  search(query: string): Drug[];
  create(dto: CreateDrugDto): Drug;
  update(id: number, dto: Partial<CreateDrugDto>): Drug | null;
  delete(id: number): boolean;
}

export interface SettingsRepository {
  getSetting(key: string): string | null;
  setSetting(key: string, value: string): void;
  getThresholds(): RiskThresholds;
  setThresholds(thresholds: RiskThresholds): void;
}
