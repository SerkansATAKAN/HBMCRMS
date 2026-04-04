import { supabase } from '@/lib/supabaseClient';
import type { Request, Task, Revize, Approval, Comment, User, ChecklistItem } from '@/types';

// ============================================================
// DB → TS Dönüştürücüler (snake_case → camelCase)
// ============================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapUser(row: any): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    department: row.department,
    avatar: row.avatar ?? undefined,
    isActive: row.is_active,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRequest(row: any): Request {
  return {
    id: row.id,
    requestNo: row.request_no,
    title: row.title,
    description: row.description,
    department: row.department,
    workType: row.work_type,
    requesterId: row.requester_id,
    requesterName: row.requester_name,
    assignedTo: row.assigned_to ?? undefined,
    assignedToName: row.assigned_to_name ?? undefined,
    status: row.status,
    priority: row.priority,
    isUrgent: row.is_urgent,
    targetDate: row.target_date,
    publishDate: row.publish_date ?? undefined,
    facility: row.facility ?? undefined,
    outlet: row.outlet ?? undefined,
    campaign: row.campaign ?? undefined,
    language: row.language ?? undefined,
    format: row.format ?? undefined,
    mandatoryText: row.mandatory_text ?? undefined,
    referenceUrl: row.reference_url ?? undefined,
    approver: row.approver ?? undefined,
    strategicImportance: row.strategic_importance ?? undefined,
    hasRevenueImpact: row.has_revenue_impact,
    isVipSensitive: row.is_vip_sensitive,
    needsExternalResource: row.needs_external_resource,
    parentRequestNo: row.parent_request_no ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    completedAt: row.completed_at ?? undefined,
    delayedDays: row.delayed_days ?? undefined,
    isDelayedCompleted: row.is_delayed_completed ?? undefined,
    revizeCount: row.revize_count ?? 0,
    maxRevizeReached: row.max_revize_reached ?? undefined,
    transferredFromRequestNo: row.transferred_from_request_no ?? undefined,
    transferredRevizeHistory: row.transferred_revize_history ?? [],
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapChecklist(row: any): ChecklistItem {
  return {
    id: row.id,
    text: row.text,
    isCompleted: row.is_completed,
    isMandatory: row.is_mandatory,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapTask(row: any): Task {
  return {
    id: row.id,
    taskNo: row.task_no,
    requestId: row.request_id,
    requestNo: row.request_no,
    requestTitle: row.request_title,
    title: row.title,
    type: row.type,
    assignedTo: row.assigned_to,
    assignedToName: row.assigned_to_name,
    reviewerId: row.reviewer_id ?? undefined,
    reviewerName: row.reviewer_name ?? undefined,
    status: row.status,
    priority: row.priority,
    dueDate: row.due_date,
    completedAt: row.completed_at ?? undefined,
    checklist: (row.checklist_items ?? []).map(mapChecklist),
    deliverableUrl: row.deliverable_url ?? undefined,
    deliverableNote: row.deliverable_note ?? undefined,
    spentHours: row.spent_hours ?? undefined,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRevize(row: any): Revize {
  return {
    id: row.id,
    revizeNo: row.revize_no,
    requestId: row.request_id ?? undefined,
    taskId: row.task_id ?? undefined,
    taskNo: row.task_no ?? undefined,
    source: row.source,
    reason: row.reason,
    expectation: row.expectation,
    referenceUrl: row.reference_url ?? undefined,
    requestedBy: row.requested_by,
    requestedByName: row.requested_by_name,
    requestedAt: row.requested_at,
    status: row.status,
    resolvedAt: row.resolved_at ?? undefined,
    revizeNumber: row.revize_number,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapApproval(row: any): Approval {
  return {
    id: row.id,
    approvalNo: row.approval_no,
    requestId: row.request_id,
    requestNo: row.request_no,
    requestTitle: row.request_title,
    submittedBy: row.submitted_by,
    submittedByName: row.submitted_by_name,
    approvalType: row.approval_type,
    submittedAt: row.submitted_at,
    deliverableUrl: row.deliverable_url ?? undefined,
    deliverableNote: row.deliverable_note ?? undefined,
    checklistCompleted: row.checklist_completed,
    checklistTotal: row.checklist_total,
    revizeCount: row.revize_count,
    status: row.status,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapComment(row: any): Comment {
  return {
    id: row.id,
    requestId: row.request_id ?? undefined,
    taskId: row.task_id ?? undefined,
    userId: row.user_id,
    userName: row.user_name,
    content: row.content,
    createdAt: row.created_at,
  };
}

// ============================================================
// Veri Yükleme
// ============================================================

export async function fetchAllData() {
  const [
    usersRes,
    requestsRes,
    tasksRes,
    checklistRes,
    revizelerRes,
    approvalsRes,
    commentsRes,
  ] = await Promise.all([
    supabase.from('users').select('*').order('name'),
    supabase.from('requests').select('*').order('created_at', { ascending: false }),
    supabase.from('tasks').select('*').order('due_date'),
    supabase.from('checklist_items').select('*').order('sort_order'),
    supabase.from('revizes').select('*').order('requested_at', { ascending: false }),
    supabase.from('approvals').select('*').order('submitted_at', { ascending: false }),
    supabase.from('comments').select('*').order('created_at'),
  ]);

  // Checklist'leri task'lara iliştir
  const checklistMap = new Map<string, ChecklistItem[]>();
  for (const row of (checklistRes.data ?? [])) {
    const item = mapChecklist(row);
    if (!checklistMap.has(row.task_id)) checklistMap.set(row.task_id, []);
    checklistMap.get(row.task_id)!.push(item);
  }

  const tasks = (tasksRes.data ?? []).map(row => mapTask({ ...row, checklist_items: checklistMap.get(row.id) ?? [] }));

  return {
    users: (usersRes.data ?? []).map(mapUser),
    requests: (requestsRes.data ?? []).map(mapRequest),
    tasks,
    revizeler: (revizelerRes.data ?? []).map(mapRevize),
    approvals: (approvalsRes.data ?? []).map(mapApproval),
    comments: (commentsRes.data ?? []).map(mapComment),
  };
}

// ============================================================
// TS → DB Dönüştürücüler (camelCase → snake_case)
// ============================================================

function requestToDb(r: Partial<Request>) {
  const db: Record<string, unknown> = {};
  if (r.requestNo !== undefined)               db.request_no = r.requestNo;
  if (r.title !== undefined)                   db.title = r.title;
  if (r.description !== undefined)             db.description = r.description;
  if (r.department !== undefined)              db.department = r.department;
  if (r.workType !== undefined)                db.work_type = r.workType;
  if (r.requesterId !== undefined)             db.requester_id = r.requesterId;
  if (r.requesterName !== undefined)           db.requester_name = r.requesterName;
  if ('assignedTo' in r)                       db.assigned_to = r.assignedTo ?? null;
  if ('assignedToName' in r)                   db.assigned_to_name = r.assignedToName ?? null;
  if (r.status !== undefined)                  db.status = r.status;
  if (r.priority !== undefined)                db.priority = r.priority;
  if (r.isUrgent !== undefined)                db.is_urgent = r.isUrgent;
  if (r.targetDate !== undefined)              db.target_date = r.targetDate;
  if ('publishDate' in r)                      db.publish_date = r.publishDate ?? null;
  if ('facility' in r)                         db.facility = r.facility ?? null;
  if ('outlet' in r)                           db.outlet = r.outlet ?? null;
  if ('campaign' in r)                         db.campaign = r.campaign ?? null;
  if ('language' in r)                         db.language = r.language ?? null;
  if ('format' in r)                           db.format = r.format ?? null;
  if ('mandatoryText' in r)                    db.mandatory_text = r.mandatoryText ?? null;
  if ('referenceUrl' in r)                     db.reference_url = r.referenceUrl ?? null;
  if ('approver' in r)                         db.approver = r.approver ?? null;
  if ('strategicImportance' in r)              db.strategic_importance = r.strategicImportance ?? null;
  if (r.hasRevenueImpact !== undefined)        db.has_revenue_impact = r.hasRevenueImpact;
  if (r.isVipSensitive !== undefined)          db.is_vip_sensitive = r.isVipSensitive;
  if (r.needsExternalResource !== undefined)   db.needs_external_resource = r.needsExternalResource;
  if ('parentRequestNo' in r)                  db.parent_request_no = r.parentRequestNo ?? null;
  if ('completedAt' in r)                      db.completed_at = r.completedAt ?? null;
  if ('delayedDays' in r)                      db.delayed_days = r.delayedDays ?? null;
  if ('isDelayedCompleted' in r)               db.is_delayed_completed = r.isDelayedCompleted ?? null;
  if (r.revizeCount !== undefined)             db.revize_count = r.revizeCount;
  if ('maxRevizeReached' in r)                 db.max_revize_reached = r.maxRevizeReached ?? null;
  if ('transferredFromRequestNo' in r)         db.transferred_from_request_no = r.transferredFromRequestNo ?? null;
  if ('transferredRevizeHistory' in r)         db.transferred_revize_history = r.transferredRevizeHistory ?? [];
  return db;
}

function taskToDb(t: Partial<Task>) {
  const db: Record<string, unknown> = {};
  if (t.taskNo !== undefined)          db.task_no = t.taskNo;
  if (t.requestId !== undefined)       db.request_id = t.requestId;
  if (t.requestNo !== undefined)       db.request_no = t.requestNo;
  if (t.requestTitle !== undefined)    db.request_title = t.requestTitle;
  if (t.title !== undefined)           db.title = t.title;
  if (t.type !== undefined)            db.type = t.type;
  if (t.assignedTo !== undefined)      db.assigned_to = t.assignedTo;
  if (t.assignedToName !== undefined)  db.assigned_to_name = t.assignedToName;
  if ('reviewerId' in t)               db.reviewer_id = t.reviewerId ?? null;
  if ('reviewerName' in t)             db.reviewer_name = t.reviewerName ?? null;
  if (t.status !== undefined)          db.status = t.status;
  if (t.priority !== undefined)        db.priority = t.priority;
  if (t.dueDate !== undefined)         db.due_date = t.dueDate;
  if ('completedAt' in t)              db.completed_at = t.completedAt ?? null;
  if ('deliverableUrl' in t)           db.deliverable_url = t.deliverableUrl ?? null;
  if ('deliverableNote' in t)          db.deliverable_note = t.deliverableNote ?? null;
  if ('spentHours' in t)               db.spent_hours = t.spentHours ?? null;
  return db;
}

function revizeToDb(r: Partial<Revize>) {
  const db: Record<string, unknown> = {};
  if (r.revizeNo !== undefined)          db.revize_no = r.revizeNo;
  if ('requestId' in r)                  db.request_id = r.requestId ?? null;
  if ('taskId' in r)                     db.task_id = r.taskId ?? null;
  if ('taskNo' in r)                     db.task_no = r.taskNo ?? null;
  if (r.source !== undefined)            db.source = r.source;
  if (r.reason !== undefined)            db.reason = r.reason;
  if (r.expectation !== undefined)       db.expectation = r.expectation;
  if ('referenceUrl' in r)               db.reference_url = r.referenceUrl ?? null;
  if (r.requestedBy !== undefined)       db.requested_by = r.requestedBy;
  if (r.requestedByName !== undefined)   db.requested_by_name = r.requestedByName;
  if (r.requestedAt !== undefined)       db.requested_at = r.requestedAt;
  if (r.status !== undefined)            db.status = r.status;
  if ('resolvedAt' in r)                 db.resolved_at = r.resolvedAt ?? null;
  if (r.revizeNumber !== undefined)      db.revize_number = r.revizeNumber;
  return db;
}

function approvalToDb(a: Partial<Approval>) {
  const db: Record<string, unknown> = {};
  if (a.approvalNo !== undefined)         db.approval_no = a.approvalNo;
  if (a.requestId !== undefined)          db.request_id = a.requestId;
  if (a.requestNo !== undefined)          db.request_no = a.requestNo;
  if (a.requestTitle !== undefined)       db.request_title = a.requestTitle;
  if (a.submittedBy !== undefined)        db.submitted_by = a.submittedBy;
  if (a.submittedByName !== undefined)    db.submitted_by_name = a.submittedByName;
  if (a.approvalType !== undefined)       db.approval_type = a.approvalType;
  if (a.submittedAt !== undefined)        db.submitted_at = a.submittedAt;
  if ('deliverableUrl' in a)              db.deliverable_url = a.deliverableUrl ?? null;
  if ('deliverableNote' in a)             db.deliverable_note = a.deliverableNote ?? null;
  if (a.checklistCompleted !== undefined) db.checklist_completed = a.checklistCompleted;
  if (a.checklistTotal !== undefined)     db.checklist_total = a.checklistTotal;
  if (a.revizeCount !== undefined)        db.revize_count = a.revizeCount;
  if (a.status !== undefined)             db.status = a.status;
  return db;
}

// ============================================================
// CRUD — Requests
// ============================================================

export async function dbAddRequest(data: Omit<Request, 'id' | 'requestNo' | 'createdAt' | 'updatedAt'> & { requestNo: string }) {
  const { data: row, error } = await supabase
    .from('requests')
    .insert(requestToDb(data as Partial<Request>))
    .select()
    .single();
  if (error) console.error('dbAddRequest error:', error);
  return row ? mapRequest(row) : null;
}

export async function dbUpdateRequest(id: string, updates: Partial<Request>) {
  const { error } = await supabase.from('requests').update(requestToDb(updates)).eq('id', id);
  if (error) console.error('dbUpdateRequest error:', error);
}

export async function dbDeleteRequest(id: string) {
  const { error } = await supabase.from('requests').delete().eq('id', id);
  if (error) console.error('dbDeleteRequest error:', error);
}

// ============================================================
// CRUD — Tasks
// ============================================================

export async function dbAddTask(data: Omit<Task, 'id' | 'taskNo'> & { taskNo: string }) {
  const { checklist, ...taskData } = data;
  const { data: row, error } = await supabase
    .from('tasks')
    .insert(taskToDb(taskData as Partial<Task>))
    .select()
    .single();
  if (error) { console.error('dbAddTask error:', error); return null; }
  if (row && checklist?.length) {
    const checklistRows = checklist.map((c, idx) => ({
      task_id: row.id,
      text: c.text,
      is_completed: c.isCompleted,
      is_mandatory: c.isMandatory,
      sort_order: idx,
    }));
    await supabase.from('checklist_items').insert(checklistRows);
  }
  return row ? mapTask({ ...row, checklist_items: checklist ?? [] }) : null;
}

export async function dbUpdateTask(id: string, updates: Partial<Task>) {
  const { checklist, ...taskUpdates } = updates;
  const { error } = await supabase.from('tasks').update(taskToDb(taskUpdates as Partial<Task>)).eq('id', id);
  if (error) console.error('dbUpdateTask error:', error);
  if (checklist) {
    await supabase.from('checklist_items').delete().eq('task_id', id);
    const rows = checklist.map((c, idx) => ({
      task_id: id,
      text: c.text,
      is_completed: c.isCompleted,
      is_mandatory: c.isMandatory,
      sort_order: idx,
    }));
    if (rows.length) await supabase.from('checklist_items').insert(rows);
  }
}

// ============================================================
// CRUD — Revizes
// ============================================================

export async function dbAddRevize(data: Revize) {
  const { error } = await supabase.from('revizes').insert(revizeToDb(data));
  if (error) console.error('dbAddRevize error:', error);
}

export async function dbUpdateRevize(id: string, updates: Partial<Revize>) {
  const { error } = await supabase.from('revizes').update(revizeToDb(updates)).eq('id', id);
  if (error) console.error('dbUpdateRevize error:', error);
}

// ============================================================
// CRUD — Approvals
// ============================================================

export async function dbAddApproval(data: Approval) {
  const { error } = await supabase.from('approvals').insert(approvalToDb(data));
  if (error) console.error('dbAddApproval error:', error);
}

export async function dbUpdateApproval(id: string, updates: Partial<Approval>) {
  const { error } = await supabase.from('approvals').update(approvalToDb(updates)).eq('id', id);
  if (error) console.error('dbUpdateApproval error:', error);
}

// ============================================================
// CRUD — Comments
// ============================================================

export async function dbAddComment(data: Comment) {
  const { error } = await supabase.from('comments').insert({
    id: data.id,
    request_id: data.requestId ?? null,
    task_id: data.taskId ?? null,
    user_id: data.userId,
    user_name: data.userName,
    content: data.content,
    created_at: data.createdAt,
  });
  if (error) console.error('dbAddComment error:', error);
}

// ============================================================
// Sequence / Sayaç Yönetimi
// ============================================================

export async function getNextRequestNo(): Promise<number> {
  const { data } = await supabase
    .from('requests')
    .select('request_no')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  if (!data?.request_no) return 73;
  const match = data.request_no.match(/(\d+)$/);
  return match ? parseInt(match[1], 10) + 1 : 73;
}

export async function getNextTaskNo(): Promise<number> {
  const { count } = await supabase.from('tasks').select('*', { count: 'exact', head: true });
  return (count ?? 9) + 1;
}

export async function getNextRevizeCount(taskId: string): Promise<number> {
  const { count } = await supabase.from('revizes').select('*', { count: 'exact', head: true }).eq('task_id', taskId);
  return (count ?? 0) + 1;
}

export async function getNextApprovalNo(): Promise<number> {
  const { count } = await supabase.from('approvals').select('*', { count: 'exact', head: true });
  return (count ?? 2) + 1;
}
