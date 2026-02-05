/**
 * TypeScript interfaces for SafeOps Co-pilot data models
 * Based on the design document schemas for Firestore collections
 */

import { Timestamp } from '@google-cloud/firestore';

/**
 * Deployment data model for deployments collection
 * Schema: deployments/{id}: {cloud, service, status, cost}
 */
export interface Deployment {
  id: string;
  cloud: 'gcp' | 'aws' | 'azure';
  service: string;
  status: 'running' | 'stopped' | 'error' | 'pending';
  cost: number;
  region: string;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  metadata: {
    instanceType?: string;
    memory?: string;
    cpu?: string;
    [key: string]: any;
  };
}

/**
 * Budget data model for budgets collection
 * Schema: budgets/{user}: {freeTierSafe, totalSpend}
 */
export interface Budget {
  userId: string;
  freeTierSafe: boolean;
  totalSpend: number;
  freeTierLimit: number;
  alerts: Array<{
    threshold: number;
    enabled: boolean;
    lastTriggered?: Timestamp | Date | null;
  }>;
  lastUpdated: Timestamp | Date;
  breakdown: {
    compute: number;
    storage: number;
    networking: number;
    other: number;
  };
}

/**
 * Input types for creating new records (without auto-generated fields)
 */
export interface CreateDeploymentInput {
  id?: string;
  cloud?: 'gcp' | 'aws' | 'azure';
  service: string;
  status?: 'running' | 'stopped' | 'error' | 'pending';
  cost?: number;
  region?: string;
  metadata?: {
    instanceType?: string;
    memory?: string;
    cpu?: string;
    [key: string]: any;
  };
}

export interface CreateBudgetInput {
  userId: string;
  freeTierSafe?: boolean;
  totalSpend?: number;
  freeTierLimit?: number;
  alerts?: Array<{
    threshold: number;
    enabled: boolean;
    lastTriggered?: Timestamp | Date | null;
  }>;
  breakdown?: {
    compute: number;
    storage: number;
    networking: number;
    other: number;
  };
}

/**
 * Update types for partial updates
 */
export interface UpdateDeploymentInput {
  cloud?: 'gcp' | 'aws' | 'azure';
  service?: string;
  status?: 'running' | 'stopped' | 'error' | 'pending';
  cost?: number;
  region?: string;
  metadata?: {
    instanceType?: string;
    memory?: string;
    cpu?: string;
    [key: string]: any;
  };
}

export interface UpdateBudgetInput {
  freeTierSafe?: boolean;
  totalSpend?: number;
  freeTierLimit?: number;
  alerts?: Array<{
    threshold: number;
    enabled: boolean;
    lastTriggered?: Timestamp | Date | null;
  }>;
  breakdown?: {
    compute: number;
    storage: number;
    networking: number;
    other: number;
  };
}

/**
 * Response types for API endpoints
 */
export interface DeploymentResponse extends Omit<Deployment, 'createdAt' | 'updatedAt'> {
  name: string; // Alias for service
  waste: number; // Calculated waste percentage
  createdAt: string;
  updatedAt: string;
}

export interface BudgetResponse extends Omit<Budget, 'lastUpdated'> {
  limit: number; // Alias for freeTierLimit
  currency: string;
  percentageUsed: number;
  lastUpdated: string;
}

/**
 * Validation error types
 */
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Real-time listener callback types
 */
export interface RealtimeCallbacks {
  onDeploymentsChange?: (deployments: Deployment[]) => void;
  onBudgetChange?: (budget: Budget) => void;
  onError?: (error: Error) => void;
}

/**
 * Service operation result types
 */
export interface ServiceStopResult {
  success: boolean;
  stoppedCount: number;
  newSpend: number;
  message: string;
  stoppedServices: Array<{
    id: string;
    name: string;
    cost: number;
  }>;
}

export interface SnapshotResult {
  billing: BudgetResponse;
  inventory: {
    total: number;
    highRisk: number;
    potentialSavings: string;
  };
  recommendation: string;
}