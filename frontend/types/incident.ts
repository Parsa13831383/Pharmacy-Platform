export type IncidentSeverity = 'INFO' | 'WARNING' | 'CRITICAL'
export type IncidentStatus   = 'SENT' | 'FAILED' | 'TEST'

export interface IncidentLog {
  id:        string
  severity:  IncidentSeverity
  type:      string
  title:     string
  message:   string
  orderId:   string | null
  phone:     string | null
  endpoint:  string | null
  status:    IncidentStatus
  createdAt: string
}

export interface IncidentListResponse {
  incidents: IncidentLog[]
}
