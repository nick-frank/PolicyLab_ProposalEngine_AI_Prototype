"use client";

import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { WORKFLOW_STAGES } from "@/lib/constants";
import type { WorkflowDeepDive, WorkflowStageStatus } from "@/lib/types";
import {
  Tags,
  Search,
  GitCompare,
  BarChart3,
  MessageSquare,
  ChevronRight,
  CheckCircle,
  Loader2,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WorkflowStageClassify } from "./workflow-stage-classify";
import { WorkflowStageRetrieve } from "./workflow-stage-retrieve";
import { WorkflowStageAnalyze } from "./workflow-stage-analyze";
import { WorkflowStageEvaluate } from "./workflow-stage-evaluate";
import { WorkflowStageExplain } from "./workflow-stage-explain";

const iconMap: Record<string, typeof Tags> = { Tags, Search, GitCompare, BarChart3, MessageSquare };

const statusConfig: Record<WorkflowStageStatus, { icon: typeof CheckCircle; color: string; label: string }> = {
  complete: { icon: CheckCircle, color: "text-green-600", label: "Complete" },
  running: { icon: Loader2, color: "text-blue-600", label: "Running" },
  pending: { icon: Clock, color: "text-muted-foreground", label: "Pending" },
};

const defaultOpenStages = new Set(["classify", "retrieve", "explain"]);

export function WorkflowPipeline({ workflow }: { workflow: WorkflowDeepDive }) {
  const [openStages, setOpenStages] = useState<Set<string>>(defaultOpenStages);

  const toggleStage = (key: string) => {
    setOpenStages((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const stageComponents: Record<string, React.ReactNode> = {
    classify: <WorkflowStageClassify data={workflow.stages.classify.data} />,
    retrieve: <WorkflowStageRetrieve data={workflow.stages.retrieve.data} />,
    analyze: <WorkflowStageAnalyze data={workflow.stages.analyze.data} />,
    evaluate: <WorkflowStageEvaluate data={workflow.stages.evaluate.data} />,
    explain: <WorkflowStageExplain data={workflow.stages.explain.data} />,
  };

  return (
    <div className="relative">
      {/* Vertical timeline line */}
      <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />

      <div className="space-y-0">
        {WORKFLOW_STAGES.map((stage, i) => {
          const stageData = workflow.stages[stage.key];
          const status = stageData.status;
          const sConfig = statusConfig[status];
          const StatusIcon = sConfig.icon;
          const StageIcon = iconMap[stage.icon];
          const isOpen = openStages.has(stage.key);

          return (
            <Collapsible key={stage.key} open={isOpen} onOpenChange={() => toggleStage(stage.key)}>
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center gap-3 py-3 pl-0 pr-4 hover:bg-muted/50 rounded-lg transition-colors relative">
                  {/* Number circle */}
                  <div className={cn(
                    "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 bg-background text-sm font-bold",
                    status === "complete" ? "border-green-500 text-green-700" :
                    status === "running" ? "border-blue-500 text-blue-700" :
                    "border-muted-foreground/30 text-muted-foreground"
                  )}>
                    {i + 1}
                  </div>

                  {/* Stage info */}
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      {StageIcon && <StageIcon className="h-4 w-4 text-muted-foreground" />}
                      <span className="text-sm font-semibold">{stage.label}</span>
                      <Badge variant="outline" className={cn("text-xs", sConfig.color)}>
                        <StatusIcon className={cn("h-3 w-3 mr-1", status === "running" && "animate-spin")} />
                        {sConfig.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{stage.description}</p>
                  </div>

                  {/* Chevron */}
                  <ChevronRight className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-90")} />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="ml-12 pb-4 pr-4">
                  {stageComponents[stage.key]}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>
    </div>
  );
}
