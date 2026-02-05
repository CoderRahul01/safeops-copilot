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
    description: "Cloud spending and budget overview",
    component: SafetyCard,
    propsSchema: z.object({
      data: z.object({ totalSpend: z.number(), budget: z.number() }),
      recommendation: z.string().optional(),
      isLoading: z.boolean()
    })
  },
  {
    name: "StatusMeter",
    description: "Real-time risk score and resource count",
    component: StatusMeter,
    propsSchema: z.object({
      metrics: z.object({ risk_score: z.number(), active_resources: z.number(), saving_potential: z.number() }),
      isLoading: z.boolean()
    })
  },
  {
    name: "ResourceList",
    description: "List of cloud resources and their status",
    component: ResourceList,
    propsSchema: z.object({
      isLoading: z.boolean()
    })
  },
  {
    name: "DeployGuard",
    description: "CI/CD safety interceptor",
    component: DeployGuard,
    propsSchema: z.object({})
  },
  {
    name: "TroubleshootingWorkflow",
    description: "Step-by-step remediation guide",
    component: TroubleshootingWorkflow,
    propsSchema: z.object({
      issueId: z.string(),
      steps: z.array(z.object({ completed: z.boolean(), label: z.string(), description: z.string() }))
    })
  },
  {
    name: "WorkflowStepper",
    description: "INTERACTIVE STEP-BY-STEP GUIDE. Use this for ANY multi-step process, especially cloud connections, guided setup, security walkthroughs, or onboarding. Features persistent state tracking.",
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
    description: "REAL-TIME SECURITY SCAN RESULT. Use this to show the output of security audits, vulnerability scans, or cloud safety checks. Visually striking with a health score and list of PASS/FAIL/WARN checks.",
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
