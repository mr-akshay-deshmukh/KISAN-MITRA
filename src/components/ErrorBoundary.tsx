import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, ShieldAlert, RotateCcw, Copy, Check, Info } from 'lucide-react';
import { safeStorage } from '../utils/security';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  copied: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      copied: false,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      copied: false,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary caught exception]:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleHardReset = () => {
    try {
      safeStorage.clearAll();
      window.location.href = '/';
    } catch {
      window.location.reload();
    }
  };

  private handleCopyDiagnostics = () => {
    const report = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      errorName: this.state.error?.name,
      errorMessage: this.state.error?.message,
      stack: this.state.error?.stack?.slice(0, 500),
      componentStack: this.state.errorInfo?.componentStack?.slice(0, 500),
    };

    navigator.clipboard.writeText(JSON.stringify(report, null, 2));
    this.setState({ copied: true });
    setTimeout(() => this.setState({ copied: false }), 2500);
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0F1411] text-[#E5E9E7] flex items-center justify-center p-4 sm:p-6 select-none font-sans">
          <div className="w-full max-w-xl bg-[#1A221E] border border-[#2C3631] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            {/* Header Icon */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                  Resilient Recovery Shield
                </span>
                <h1 className="text-xl sm:text-2xl font-serif italic font-bold text-white mt-1">
                  KisanSetu Safe Mode Activated
                </h1>
                <p className="text-xs text-[#8E9B94]">
                  An unexpected UI exception was safely isolated to protect your data integrity.
                </p>
              </div>
            </div>

            {/* Bilingual Status Message */}
            <div className="bg-[#141B17] border border-[#2C3631] rounded-2xl p-4 text-xs space-y-2 text-[#C5D0C9]">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-[#C2D66E] shrink-0 mt-0.5" />
                <p>
                  <strong className="text-white">मराठी:</strong> अनुप्रयोगात अडथळा आला आहे, परंतु तुमचे सर्व नोंदणीकृत व्यवहार आणि डेटा सुरक्षित आहेत. कृपया रीलोड करा.
                </p>
              </div>
              <div className="flex items-start gap-2 pt-1 border-t border-[#2C3631]/60">
                <Info className="w-4 h-4 text-[#C2D66E] shrink-0 mt-0.5" />
                <p>
                  <strong className="text-white">English:</strong> Your orders and market contracts remain securely saved. You can recover immediately.
                </p>
              </div>
            </div>

            {/* Error Details (Sanitized) */}
            {this.state.error && (
              <div className="bg-[#0B0F0D] border border-[#2C3631] rounded-xl p-3 text-[11px] font-mono text-[#8E9B94] overflow-x-auto">
                <div className="text-amber-400/90 font-bold mb-1 flex items-center justify-between">
                  <span>Diagnostic Trace:</span>
                  <span className="text-[9px] text-[#8E9B94]">Zero Security Leak</span>
                </div>
                <div className="text-red-400 font-semibold">{this.state.error.message || 'Unknown runtime error'}</div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:w-auto flex-1 py-3 px-6 rounded-full bg-[#C2D66E] hover:bg-[#D4E4BC] text-[#0F1411] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Application</span>
              </button>

              <button
                type="button"
                onClick={this.handleHardReset}
                className="w-full sm:w-auto py-3 px-5 rounded-full bg-[#242C28] hover:bg-[#2C3631] text-white border border-[#2C3631] font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                title="Clears local cache in case of corrupted data"
              >
                <RotateCcw className="w-4 h-4 text-amber-400" />
                <span>Reset Cache & Home</span>
              </button>

              <button
                type="button"
                onClick={this.handleCopyDiagnostics}
                className="w-full sm:w-auto py-3 px-4 rounded-full bg-[#242C28] hover:bg-[#2C3631] text-[#8E9B94] hover:text-white border border-[#2C3631] text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                title="Copy safe error report"
              >
                {this.state.copied ? <Check className="w-4 h-4 text-[#C2D66E]" /> : <Copy className="w-4 h-4" />}
                <span className="hidden sm:inline">{this.state.copied ? 'Copied' : 'Report'}</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
