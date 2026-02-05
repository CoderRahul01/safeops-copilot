"use client";

import { TamboProvider } from "@tambo-ai/react";
import { z } from "zod";
import { 
  SafetyCard, 
  StatusMeter, 
  ResourceList, 
  DeployGuard,
  TroubleshootingWorkflow,
  WorkflowStepper,
  SafetyAudit
} from "@/components/TamboComponents";

const tamboComponents = [
  {
    name: "SafetyCard",
    description: "ULTRA-PREMIUM SPEND OVERVIEW. Use this ALWAYS when the user asks about costs, budgets, or financial safety. Provides high-impact visual alerts for critical waste.",
    component: SafetyCard,
    propsSchema: z.object({
      data: z.object({ totalSpend: z.number(), budget: z.number() }),
      recommendation: z.string().optional(),
      isLoading: z.boolean()
    })
  },
  {
    name: "StatusMeter",
    description: "REAL-TIME RISK CONSOLE. Use this for general health checks, risk assessments, or resource load monitoring. Shows risk score percentage and active resource counts.",
    component: StatusMeter,
    propsSchema: z.object({
      metrics: z.object({ risk_score: z.number(), active_resources: z.number(), saving_potential: z.number() }),
      isLoading: z.boolean()
    })
  },
  {
    name: "ResourceList",
    description: "CINEMATIC INVENTORY TABLE. Use this to list specific resources (nodes, instances, buckets). Shows regions, operational status, and trend data.",
    component: ResourceList,
    propsSchema: z.object({
      isLoading: z.boolean()
    })
  },
  {
    name: "DeployGuard",
    description: "SECURITY INTERCEPTOR. Use this to show active shielding or blockade status. High-impact visual for unauthorized access prevention.",
    component: DeployGuard,
    propsSchema: z.object({})
  },
  {
    name: "TroubleshootingWorkflow",
    description: "STEP-BY-STEP REMEDIATION. Use this for interactive repair tasks. Includes 'Synchronize Repairs' button for real-time backend execution.",
    component: TroubleshootingWorkflow,
    propsSchema: z.object({
      issueId: z.string().describe("UUID for the issue"),
      steps: z.array(z.object({ completed: z.boolean(), label: z.string(), description: z.string() }))
    })
  },
  {
    name: "WorkflowStepper",
    description: "INTERACTIVE GUIDED EXPERIENCE. MANDATORY for cloud connections, setup protocols, and any task requiring user interaction/confirmation step-by-step. Minimizes text, maximizes interaction.",
    component: WorkflowStepper,
    propsSchema: z.object({
      id: z.string().optional().describe("Unique identifier for this workflow session"),
      title: z.string().describe("Impactful title for the workflow"),
      steps: z.array(z.object({ 
        label: z.string().describe("Concise step name"), 
        description: z.string().describe("Detailed guidance for this specific step") 
       }))
    })
  },
  {
    name: "SafetyAudit",
    description: "CINEMATIC SECURITY SCAN. Use for auditing logs, scanning environments, and displaying PASS/FAIL/WARN results with a total health score.",
    component: SafetyAudit,
    propsSchema: z.object({
      score: z.number().min(0).max(100).describe("Overall security health score (0-100)"),
      checks: z.array(z.object({
        category: z.string().describe("Security domain (e.g. Identity, Compute, Network)"),
        status: z.enum(['PASS', 'FAIL', 'WARN']).describe("Status of the check"),
        message: z.string().describe("Actionable advice or finding")
      }))
    })
  }
];

export function TamboClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <TamboProvider 
      apiKey={process.env.NEXT_PUBLIC_TAMBO_API_KEY!}
      components={tamboComponents}
    >
      {children}
    </TamboProvider>
  );
}
