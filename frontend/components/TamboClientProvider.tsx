"use client";

import { TamboProvider, defineTool } from "@tambo-ai/react";
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
import { useAuth } from "@/components/AuthProvider";
import { useState, useEffect, useMemo } from "react";

export function TamboClientProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [userToken, setUserToken] = useState<string | undefined>(undefined);

  const memoizedComponents = useMemo(() => tamboComponents, []);

  useEffect(() => {
    let active = true;
    if (user) {
      user.getIdToken().then(token => {
        if (active) setUserToken(token);
      });
    } else {
      Promise.resolve().then(() => {
        if (active) setUserToken(undefined);
      });
    }
    return () => { active = false; };
  }, [user]);

  // AI Power-Tools: Bridging GenUI to Backend Actions
  const tools = useMemo(() => {
    if (!userToken) return [];

    return [
      defineTool({
        name: "getInventory",
        description: "Fetch the live list of cloud resources and their operational status. Use this to populate ResourceList or StatusMeter.",
        inputSchema: z.object({}),
        tool: async () => {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/inventory/resources`, {
            headers: { 'Authorization': `Bearer ${userToken}` }
          });
          return res.json();
        }
      }),
      defineTool({
        name: "remediateIssue",
        description: "Trigger a security remediation action for a specific finding. Use this when the user accepts a suggestion to fix a leak or secure a resource.",
        inputSchema: z.object({
          issueId: z.string().describe("The unique ID of the security finding (e.g. SEC-001)"),
          stepIndex: z.number().describe("The current step index in the troubleshooting workflow")
        }),
        tool: async ({ issueId, stepIndex }) => {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/security-audit/remediate`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${userToken}` 
            },
            body: JSON.stringify({ issueId, stepIndex })
          });
          return res.json();
        }
      }),
      defineTool({
        name: "stopService",
        description: "Scale a Cloud Run service to zero and stop concurrent billing immediately. Use this for high-risk waste or emergency lockdown.",
        inputSchema: z.object({
          serviceName: z.string().describe("The technical name of the Cloud Run service"),
          region: z.string().optional().default('us-central1').describe("The GCP deployment region")
        }),
        tool: async ({ serviceName, region }) => {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cloud/gcp/stop-service`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${userToken}` 
            },
            body: JSON.stringify({ serviceName, region })
          });
          return res.json();
        }
      })
    ];
  }, [userToken]);

  // Context Helpers feed the AI real-time dashboard state & behavioral rules
  const contextHelpers = useMemo(() => ({
    getTelemetry: () => ({
      risk_score: 0.12,
      active_resources: 24,
      saving_potential: 450.00,
      total_spend: 1240.50,
      budget: 2000.00,
      status: "OPTIMIZED",
      last_audit: new Date().toISOString()
    }),
    getSystemStatus: () => ({
      firewall: "ACTIVE",
      load_balancer: "HEALTHY",
      db_latency: "14ms"
    }),
    systemDirectives: () => ({
      tone: "CINEMATIC_TECHNICAL_CONSOLE",
      ui_rule: "FORBIDDEN: PLAIN_TEXT_RESPONSES. ALWAYS wrap narratives in MainframeReport. ALWAYS use visual components for data.",
      fallback: "If no specific component fits, use MainframeReport with technical status markers."
    })
  }), []);

  return (
    <TamboProvider 
      apiKey={process.env.NEXT_PUBLIC_TAMBO_API_KEY!}
      components={memoizedComponents}
      userToken={userToken}
      tools={tools}
      contextHelpers={contextHelpers}
    >
      {children}
    </TamboProvider>
  );
}
