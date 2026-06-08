'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle2, FlaskConical, Info, RefreshCw, Zap } from 'lucide-react'
import { AdminShell } from '@/components/admin/AdminShell'
import { Button } from '@/components/ui/button'
import { getAdminIncidents, triggerTestAlert, triggerTestEmergencyAlert } from '@/lib/api'
import type { AlertDiagnosticResponse, EmergencyAlertDiagnosticResponse } from '@/lib/api'
import type { IncidentLog, IncidentSeverity, IncidentStatus } from '@/types/incident'
import { cn } from '@/lib/utils'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtDate(s: string) {
  return new Date(s).toLocaleString('fa-IR', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}

// ─── Severity badge ───────────────────────────────────────────────────────────

const SEVERITY_LABEL: Record<IncidentSeverity, string> = {
  CRITICAL: 'بحرانی',
  WARNING:  'هشدار',
  INFO:     'اطلاعات',
}

const SEVERITY_CLASS: Record<IncidentSeverity, string> = {
  CRITICAL: 'bg-destructive/10 text-destructive border border-destructive/20',
  WARNING:  'bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-400',
  INFO:     'bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-400',
}

const SEVERITY_ICON: Record<IncidentSeverity, React.ComponentType<{ className?: string }>> = {
  CRITICAL: AlertTriangle,
  WARNING:  AlertTriangle,
  INFO:     Info,
}

function SeverityBadge({ severity }: { severity: IncidentSeverity }) {
  const Icon = SEVERITY_ICON[severity]
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full', SEVERITY_CLASS[severity])}>
      <Icon className="w-3 h-3" />
      {SEVERITY_LABEL[severity]}
    </span>
  )
}

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<IncidentStatus, string> = {
  SENT:   'ارسال شد',
  FAILED: 'خطا',
  TEST:   'تست',
}

const STATUS_CLASS: Record<IncidentStatus, string> = {
  SENT:   'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
  FAILED: 'bg-destructive/10 text-destructive',
  TEST:   'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
}

const STATUS_ICON: Record<IncidentStatus, React.ComponentType<{ className?: string }>> = {
  SENT:   CheckCircle2,
  FAILED: AlertTriangle,
  TEST:   FlaskConical,
}

function StatusBadge({ status }: { status: IncidentStatus }) {
  const Icon = STATUS_ICON[status]
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full', STATUS_CLASS[status])}>
      <Icon className="w-3 h-3" />
      {STATUS_LABEL[status]}
    </span>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function diagMessage(res: AlertDiagnosticResponse | EmergencyAlertDiagnosticResponse): string {
  if (!('enabled' in res) || res.mode === 'disabled') return 'هشدارها غیرفعال است (INCIDENT_ALERTS_ENABLED=false)'
  if (res.mode === 'test')    return 'پیام تست در ترمینال بک‌اند چاپ شد'
  if (res.pushoverError)      return `خطا: ${res.pushoverError}`
  if (res.pushoverStatus === 200) return `ارسال موفق (HTTP ${res.pushoverStatus})`
  return 'عملیات تکمیل شد'
}

export default function IncidentsPage() {
  const [incidents, setIncidents]       = useState<IncidentLog[]>([])
  const [loading, setLoading]           = useState(true)
  const [testing, setTesting]           = useState(false)
  const [testMsg, setTestMsg]           = useState('')
  const [testingEmergency, setTestingEmergency] = useState(false)
  const [emergencyMsg, setEmergencyMsg] = useState('')
  const [refreshing, setRefreshing]     = useState(false)

  function load(showRefresh = false) {
    if (showRefresh) setRefreshing(true)
    else setLoading(true)
    getAdminIncidents()
      .then(setIncidents)
      .catch(() => null)
      .finally(() => { setLoading(false); setRefreshing(false) })
  }

  useEffect(() => { load() }, [])

  async function handleTestAlert() {
    setTesting(true)
    setTestMsg('')
    try {
      const res = await triggerTestAlert()
      setTestMsg(diagMessage(res))
      setTimeout(() => load(true), 800)
    } catch {
      setTestMsg('خطا در ارسال تست')
    } finally {
      setTesting(false)
    }
  }

  async function handleTestEmergencyAlert() {
    setTestingEmergency(true)
    setEmergencyMsg('')
    try {
      const res = await triggerTestEmergencyAlert()
      setEmergencyMsg(diagMessage(res))
      setTimeout(() => load(true), 800)
    } catch {
      setEmergencyMsg('خطا در ارسال آلارم اضطراری')
    } finally {
      setTestingEmergency(false)
    }
  }

  const criticalCount = incidents.filter(i => i.severity === 'CRITICAL').length
  const sentCount     = incidents.filter(i => i.status   === 'SENT').length
  const testCount     = incidents.filter(i => i.status   === 'TEST').length

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">هشدارها</h1>
            <p className="text-sm text-muted-foreground mt-1">رویدادهای بحرانی و وضعیت سیستم پایش</p>
          </div>
          <div className="flex flex-wrap items-start gap-3 shrink-0">
            {/* Refresh */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => load(true)}
              disabled={refreshing}
              className="gap-1.5 text-xs"
            >
              <RefreshCw className={cn('w-3.5 h-3.5', refreshing && 'animate-spin')} />
              بروزرسانی
            </Button>

            {/* Normal test */}
            <div className="flex flex-col items-end gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={handleTestAlert}
                disabled={testing}
                className="gap-1.5 text-xs"
              >
                <Zap className="w-3.5 h-3.5" />
                {testing ? 'در حال ارسال…' : 'ارسال تست'}
              </Button>
              {testMsg && (
                <span className="text-xs text-muted-foreground max-w-[200px] text-right">{testMsg}</span>
              )}
            </div>

            {/* Emergency test */}
            <div className="flex flex-col items-end gap-1">
              <Button
                size="sm"
                onClick={handleTestEmergencyAlert}
                disabled={testingEmergency}
                className="gap-1.5 text-xs bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                {testingEmergency ? 'در حال ارسال…' : 'تست آلارم اضطراری'}
              </Button>
              {emergencyMsg && (
                <span className="text-xs text-muted-foreground max-w-[200px] text-right">{emergencyMsg}</span>
              )}
              <p className="text-xs text-destructive/70 max-w-[220px] text-right leading-relaxed">
                این تست ممکن است هر ۶۰ ثانیه تکرار شود تا زمانی که در برنامه Pushover آن را تأیید کنید.
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-card rounded-2xl border border-border p-4 text-center">
            <p className="text-2xl font-bold tabular-nums text-destructive">{criticalCount.toLocaleString('fa-IR')}</p>
            <p className="text-xs text-muted-foreground mt-1">بحرانی</p>
          </div>
          <div className="bg-card rounded-2xl border border-border p-4 text-center">
            <p className="text-2xl font-bold tabular-nums text-emerald-600">{sentCount.toLocaleString('fa-IR')}</p>
            <p className="text-xs text-muted-foreground mt-1">ارسال شده</p>
          </div>
          <div className="bg-card rounded-2xl border border-border p-4 text-center">
            <p className="text-2xl font-bold tabular-nums text-purple-600">{testCount.toLocaleString('fa-IR')}</p>
            <p className="text-xs text-muted-foreground mt-1">تست</p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <span className="w-5 h-5 border-2 border-muted border-t-primary rounded-full animate-spin" />
            </div>
          ) : incidents.length === 0 ? (
            <div className="text-center text-muted-foreground py-16 text-sm">
              هیچ رویدادی ثبت نشده است.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-right text-muted-foreground font-medium px-5 py-3">نوع</th>
                    <th className="text-right text-muted-foreground font-medium px-4 py-3">پیام</th>
                    <th className="text-right text-muted-foreground font-medium px-4 py-3 hidden sm:table-cell">شدت</th>
                    <th className="text-right text-muted-foreground font-medium px-4 py-3 hidden md:table-cell">وضعیت</th>
                    <th className="text-right text-muted-foreground font-medium px-4 py-3 hidden lg:table-cell">سفارش</th>
                    <th className="text-right text-muted-foreground font-medium px-4 py-3">زمان</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {incidents.map((inc) => (
                    <tr
                      key={inc.id}
                      className={cn(
                        'hover:bg-muted/20 transition-colors',
                        inc.severity === 'CRITICAL' && inc.status !== 'TEST' && 'bg-destructive/5',
                      )}
                    >
                      <td className="px-5 py-3 font-mono text-xs text-foreground whitespace-nowrap">
                        {inc.type}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground max-w-xs">
                        <p className="line-clamp-2 text-xs leading-relaxed">{inc.message}</p>
                        {inc.endpoint && (
                          <p className="text-xs text-muted-foreground/60 font-mono mt-0.5" dir="ltr">{inc.endpoint}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell whitespace-nowrap">
                        <SeverityBadge severity={inc.severity} />
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell whitespace-nowrap">
                        <StatusBadge status={inc.status} />
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        {inc.orderId ? (
                          <span className="font-mono text-xs text-muted-foreground">{inc.orderId.slice(0, 8)}…</span>
                        ) : (
                          <span className="text-muted-foreground/40 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {fmtDate(inc.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Guide */}
        <div className="bg-muted/30 rounded-2xl border border-border p-5 text-sm text-muted-foreground space-y-2" dir="rtl">
          <p className="font-semibold text-foreground text-xs">راهنمای تست سیستم هشدار</p>
          <p className="text-xs">۱. متغیرهای محیطی را تنظیم کنید: <code className="bg-muted px-1 rounded text-xs font-mono">INCIDENT_ALERTS_ENABLED=true</code> و <code className="bg-muted px-1 rounded text-xs font-mono">INCIDENT_ALERTS_TEST_MODE=true</code></p>
          <p className="text-xs">۲. دکمه «ارسال تست» را بزنید — پیام کامل در ترمینال بک‌اند چاپ می‌شود.</p>
          <p className="text-xs">۳. برای ارسال واقعی به تلفن: <code className="bg-muted px-1 rounded text-xs font-mono">INCIDENT_ALERTS_TEST_MODE=false</code> را تنظیم کنید و مقادیر Pushover را وارد کنید.</p>
        </div>
      </div>
    </AdminShell>
  )
}
