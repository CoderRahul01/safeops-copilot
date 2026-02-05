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
  SafetyAudit,
  FreeTierSentinel,
  CloudAchievement,
  MainframeReport
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
  },
  {
    name: "FreeTierSentinel",
    description: "INTERACTIVE FREE-TIER GUARDIAN. Use this for ANY query about costs, free tier limits, or money leaks. Visually identifies paid 'traps' and provides a direct 'Synchronize Tier Downgrade' button to save money immediately.",
    component: FreeTierSentinel,
    propsSchema: z.object({
      data: z.object({
        score: z.number().describe("Aggregated tier health score (0-100)"),
        leakage: z.number().describe("Monthly dollar amount being lost to paid-tier traps"),
        traps: z.array(z.object({
          resource: z.string().describe("Name of the leaking resource"),
          cost: z.number().describe("Monthly cost of the trap"),
          trapType: z.string().describe("Technical reason for the charge (e.g. Idle Elastic IP)")
        }))
      }),
      isLoading: z.boolean()
    })
  },
  {
    name: "CloudAchievement",
    description: "GAMIFIED REWARD NOTIFICATION. Use this to reward users for positive actions like fixing a leak, securing a resource, or completing an onboarding step. High-impact visual for retention.",
    component: CloudAchievement,
    propsSchema: z.object({
      title: z.string().describe("Impactful title for the achievement"),
      points: z.number().describe("Security/Reward points given (e.g. 50, 100)"),
      description: z.string().describe("Congratulatory message detailing the achievement"),
      icon: z.string().optional().describe("Emoji or Lucide icon name for the trophy")
    })
  },
  {
    name: "MainframeReport",
    description: "MANDATORY NARRATIVE WRAPPER. SYSTEM_RULE: You are FORBIDDEN from using the standard 'text' response part. Every explanation, greeting, or report MUST be wrapped in this component. Use high-impact technical titles.",
    component: MainframeReport,
    propsSchema: z.object({
      title: z.string().describe("Impactful technical title (e.g., 'SECURITY_PROTOCOL_OVERVIEW')"),
      content: z.string().describe("The narrative content or explanation for the user"),
      status: z.string().optional().describe("Transmission status (e.g., 'DECRYPTED', 'LIVE_FEED')")
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
