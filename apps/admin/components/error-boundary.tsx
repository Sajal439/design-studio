"use client";

import React from "react";
import { Button } from "@repo/ui/button";
import { AlertTriangle } from "lucide-react";

interface Props {
    children: React.ReactNode;
    fallbackTitle?: string;
}

interface State {
    hasError: boolean;
    message: string;
}

export class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, message: "" };
    }

    static getDerivedStateFromError(error: unknown): State {
        return {
            hasError: true,
            message:
                error instanceof Error ? error.message : "An unexpected error occurred.",
        };
    }

    componentDidCatch(error: unknown, info: React.ErrorInfo) {
        console.error("ErrorBoundary caught:", error, info.componentStack);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
                    <AlertTriangle className="h-10 w-10 text-destructive/60" />
                    <div>
                        <p className="font-semibold">
                            {this.props.fallbackTitle ?? "Something went wrong"}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {this.state.message}
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => this.setState({ hasError: false, message: "" })}
                    >
                        Try again
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}
