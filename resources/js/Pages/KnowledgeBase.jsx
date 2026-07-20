import React, { useState, useMemo } from 'react';
import {
    BookOpen, Search, Shield, Receipt,
    Coins, Truck, FileCheck, FileText, CheckSquare,
    Settings, Database, ChevronRight, HelpCircle,
    ClipboardList, Users, UserCircle, Tag, Briefcase,
    Info, AlertTriangle, CheckCircle, ChevronDown, ChevronUp
} from 'lucide-react';

/* ─── Reusable sub-components ─────────────────────────────────────────── */

const InfoBox = ({ icon: Icon, color, title, children }) => (
    <div style={{
        padding: '14px 16px', borderRadius: '8px',
        background: `${color}10`, border: `1px solid ${color}30`,
        display: 'flex', gap: '12px', alignItems: 'flex-start'
    }}>
        <Icon size={16} color={color} style={{ marginTop: '2px', flexShrink: 0 }} />
        <div>
            {title && <strong style={{ fontSize: '0.85rem', color, display: 'block', marginBottom: '4px' }}>{title}</strong>}
            <div style={{ fontSize: '0.83rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{children}</div>
        </div>
    </div>
);

const StepList = ({ steps }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {steps.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{
                    width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                    background: 'var(--color-accent)', color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.72rem', fontWeight: 700
                }}>{i + 1}</div>
                <div style={{ paddingTop: '2px' }}>
                    {typeof s === 'string'
                        ? <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{s}</p>
                        : <><strong style={{ fontSize: '0.875rem', display: 'block' }}>{s.title}</strong>
                            <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{s.desc}</p></>
                    }
                </div>
            </div>
        ))}
    </div>
);

const FieldTable = ({ fields }) => (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem' }}>
        <thead>
            <tr style={{ background: 'var(--bg-input)' }}>
                <th style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--color-text-muted)', fontWeight: 600, borderBottom: '1px solid var(--border-subtle)' }}>Field</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--color-text-muted)', fontWeight: 600, borderBottom: '1px solid var(--border-subtle)' }}>Required</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--color-text-muted)', fontWeight: 600, borderBottom: '1px solid var(--border-subtle)' }}>Description</th>
            </tr>
        </thead>
        <tbody>
            {fields.map((f, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--color-text-primary)', whiteSpace: 'nowrap' }}>{f.name}</td>
                    <td style={{ padding: '8px 12px' }}>
                        <span style={{
                            fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px',
                            background: f.req ? 'rgba(16,185,129,0.1)' : 'rgba(100,116,139,0.1)',
                            color: f.req ? 'var(--color-success)' : 'var(--color-text-muted)'
                        }}>{f.req ? 'Yes' : 'Optional'}</span>
                    </td>
                    <td style={{ padding: '8px 12px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{f.desc}</td>
                </tr>
            ))}
        </tbody>
    </table>
);

const StatusBadge = ({ label, color, desc }) => (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '8px 0' }}>
        <span style={{
            display: 'inline-block', padding: '2px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700,
            background: `${color}18`, color, flexShrink: 0, marginTop: '2px'
        }}>{label}</span>
        <p style={{ margin: 0, fontSize: '0.83rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{desc}</p>
    </div>
);

const Section = ({ title, children }) => (
    <div style={{ marginBottom: '24px' }}>
        <h4 style={{ margin: '0 0 10px', fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>{title}</h4>
        {children}
    </div>
);

/* ─── Topic Definitions ───────────────────────────────────────────────── */

const buildTopics = () => [
    {
        id: 'overview',
        label: 'CRM Overview & Roles',
        icon: HelpCircle,
        keywords: 'overview introduction roles access admin staff login password workspace portal',
        content: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <Section title="What is Balancely CRM?">
                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
                        Balancely CRM is an internal, secure financial management portal built for retail and distribution businesses. It centralises daily accounts book-keeping, employee salary advances, vendor reconciliations, cheque tracking, cargo delivery logs, and staff management in a single place — removing the need for physical registers or scattered spreadsheets.
                    </p>
                </Section>
                <Section title="User Roles">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div className="card" style={{ padding: '16px', borderTop: '3px solid #6366f1' }}>
                            <h5 style={{ margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-accent)' }}><Shield size={15} /> Administrator</h5>
                            <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.82rem', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
                                <li>Full access to all modules</li>
                                <li>Register and manage staff accounts</li>
                                <li>Reset staff passwords and send login emails</li>
                                <li>Create / edit / delete master categories and designations</li>
                                <li>Configure company-wide CRM settings</li>
                                <li>View and manage all staff records</li>
                            </ul>
                        </div>
                        <div className="card" style={{ padding: '16px', borderTop: '3px solid #10b981' }}>
                            <h5 style={{ margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-success)' }}><UserCircle size={15} /> Accounts Staff</h5>
                            <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.82rem', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
                                <li>Record and view all transactions in Day Book</li>
                                <li>Log cargo shipments and mark payments</li>
                                <li>Manage vendor statements and cheque register</li>
                                <li>Record salary advances</li>
                                <li>Add and complete tasks & reminders</li>
                                <li>Update own profile and password</li>
                            </ul>
                        </div>
                    </div>
                </Section>
                <Section title="First Login">
                    <StepList steps={[
                        { title: 'Check your email', desc: 'You will receive a welcome email containing your login email address and a temporary password.' },
                        { title: 'Click "Sign In to Workspace"', desc: 'The button in the email takes you directly to the CRM login page.' },
                        { title: 'Enter your credentials', desc: 'Use the email and password provided in the welcome email.' },
                        { title: 'Change your password immediately', desc: 'Navigate to My Profile → Change Password tab and set a secure personal password.' },
                    ]} />
                </Section>
                <Section title="Daily Workflow Summary">
                    <StepList steps={[
                        { title: 'Open Dashboard', desc: 'Check today\'s inflow/outflow totals, the net cash balance, and pending task count.' },
                        { title: 'Record Transactions', desc: 'Log all cash inflows and outflows as they happen via the Day Book.' },
                        { title: 'Log Cargo Deliveries', desc: 'When goods leave the warehouse, add an entry in Cargo Log with bill number and freight amount.' },
                        { title: 'Check Cheque Due Dates', desc: 'Review the Cheque Register for any cheques due today and update their status after bank clearance.' },
                        { title: 'Complete Assigned Tasks', desc: 'Mark off any tasks assigned by the admin in Tasks & Reminders.' },
                        { title: 'Log Activities', desc: 'Record any significant business events or notes in the Activity Log for audit trail.' },
                    ]} />
                </Section>
            </div>
        )
    },
    {
        id: 'dashboard',
        label: 'Dashboard',
        icon: ClipboardList,
        keywords: 'dashboard stats overview inflow outflow net balance chart trend activities tasks quick add',
        content: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <Section title="What You See on the Dashboard">
                    <p style={{ margin: '0 0 12px', fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                        The Dashboard is the first page you see after logging in. It gives a real-time snapshot of today's financial activity and pending work.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        {[
                            { label: "Today's Inflow", desc: "Sum of all inflow transactions recorded today." },
                            { label: "Today's Outflow", desc: "Sum of all outflow transactions recorded today." },
                            { label: "Net Balance Change", desc: "Today's inflow minus today's outflow — shows if the business is positive or negative for the day." },
                            { label: "Activities Today", desc: "Count of activity log entries recorded so far today." },
                            { label: "Pending Tasks", desc: "Total number of tasks with 'pending' status across all users." },
                            { label: "7-Day Trend Chart", desc: "Bar chart showing daily inflow vs outflow for the past 7 days to spot patterns." },
                        ].map((item, i) => (
                            <div key={i} className="card" style={{ padding: '12px 14px' }}>
                                <strong style={{ fontSize: '0.83rem', display: 'block', marginBottom: '4px' }}>{item.label}</strong>
                                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </Section>
                <Section title="Quick Actions (+ Add Buttons)">
                    <p style={{ margin: '0 0 10px', fontSize: '0.83rem', color: 'var(--color-text-secondary)' }}>The Dashboard has three shortcut buttons to quickly create records without navigating away:</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <InfoBox icon={CheckCircle} color="#6366f1" title="Log Activity">Opens a modal to add an entry to the Activity Log — choose the activity type (e.g. Supplier Follow-up, Customer Inquiry, Internal Note) and enter details.</InfoBox>
                        <InfoBox icon={CheckCircle} color="#10b981" title="Record Transaction">Opens a transaction modal — select Inflow or Outflow, enter amount, category, date, and description.</InfoBox>
                        <InfoBox icon={CheckCircle} color="#f59e0b" title="Add Task">Opens a task creation form — enter title, description, and due date for a new reminder.</InfoBox>
                    </div>
                </Section>
                <Section title="Recent Activity Feed">
                    <p style={{ margin: 0, fontSize: '0.83rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                        The Dashboard automatically shows the 5 most recent activity log entries below the stats cards. This gives a quick audit view of what has been done today without navigating to the full Activity Log.
                    </p>
                </Section>
            </div>
        )
    },
    {
        id: 'daybook',
        label: 'Day Book',
        icon: Receipt,
        keywords: 'daybook transaction inflow outflow category amount description date filter search record cash',
        content: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <Section title="Purpose">
                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
                        The Day Book is the financial heart of the CRM. Every rupee that comes in or goes out of the business must be recorded here. It replaces physical cash book registers and provides a searchable, filterable digital ledger of all monetary transactions.
                    </p>
                </Section>
                <Section title="Transaction Types">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div className="card" style={{ padding: '14px', borderLeft: '4px solid var(--color-success)' }}>
                            <strong style={{ color: 'var(--color-success)', display: 'block', marginBottom: '6px' }}>📥 Inflow (Money In)</strong>
                            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>Record when money is received: customer payments, bank deposits, owner capital, advance receipts from buyers, GST refunds, etc.</p>
                        </div>
                        <div className="card" style={{ padding: '14px', borderLeft: '4px solid var(--color-danger)' }}>
                            <strong style={{ color: 'var(--color-danger)', display: 'block', marginBottom: '6px' }}>📤 Outflow (Money Out)</strong>
                            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>Record when money is spent: supplier payments, freight charges, rent, electricity, petty cash expenses, staff salary payments, etc.</p>
                        </div>
                    </div>
                </Section>
                <Section title="How to Record a Transaction">
                    <StepList steps={[
                        'Click the "+ Add Transaction" button on the top right.',
                        'Select the type: Inflow or Outflow.',
                        'Enter the exact amount in rupees.',
                        'Select a Category from the dropdown (managed in Master Data).',
                        'Enter a clear Description — e.g. "Payment from Reliance store for October invoice #INV-221".',
                        'Set the Transaction Date (defaults to today).',
                        'Click "Save Transaction". The entry appears instantly in the list.',
                    ]} />
                    <div style={{ marginTop: '12px' }}>
                        <InfoBox icon={Info} color="#6366f1" title="Auto Activity Log">Every transaction you record is automatically added to the Activity Log as a system entry for audit trail purposes. You don't need to manually log it separately.</InfoBox>
                    </div>
                </Section>
                <Section title="Form Fields Reference">
                    <FieldTable fields={[
                        { name: 'Type', req: true, desc: 'Inflow (money received) or Outflow (money spent).' },
                        { name: 'Amount', req: true, desc: 'The transaction value in rupees. Must be greater than ₹0.01.' },
                        { name: 'Category', req: false, desc: 'Select from pre-configured categories in Master Data.' },
                        { name: 'Description', req: true, desc: 'Free-text explanation of what the transaction is for.' },
                        { name: 'Transaction Date', req: true, desc: 'Date the money was physically exchanged (defaults to today).' },
                    ]} />
                </Section>
                <Section title="Filtering and Searching">
                    <p style={{ margin: '0 0 10px', fontSize: '0.83rem', color: 'var(--color-text-secondary)' }}>Use the filter bar at the top to narrow down records:</p>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.83rem', color: 'var(--color-text-secondary)', lineHeight: 1.8 }}>
                        <li><strong>Type filter</strong> — Show only inflows or outflows.</li>
                        <li><strong>Category filter</strong> — Filter by a specific category name.</li>
                        <li><strong>Date filter</strong> — Show transactions for a specific date.</li>
                        <li><strong>Search bar</strong> — Search by description or category name (partial match supported).</li>
                    </ul>
                    <div style={{ marginTop: '10px' }}>
                        <InfoBox icon={Info} color="#f59e0b">Filters update the list in real-time as you type or change selections — no need to click a "Search" button.</InfoBox>
                    </div>
                </Section>
            </div>
        )
    },
    {
        id: 'activities',
        label: 'Activity Log',
        icon: ClipboardList,
        keywords: 'activity log audit trail supplier followup customer inquiry reconciliation expense note reference',
        content: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <Section title="Purpose">
                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
                        The Activity Log is a chronological audit trail of all significant business events and actions. It is used for traceability — to know what happened, who did it, and when. Every transaction entered in the Day Book is also automatically logged here.
                    </p>
                </Section>
                <Section title="Activity Types">
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <StatusBadge label="Supplier Follow-up" color="#6366f1" desc="Log calls or emails made to a supplier regarding pending invoices, credit notes, or delivery delays." />
                        <StatusBadge label="Customer Inquiry" color="#10b981" desc="Record when a customer calls or visits with a query, complaint, or order-related question." />
                        <StatusBadge label="Reconciliation" color="#f59e0b" desc="Note when a bank statement, vendor statement, or ledger balance reconciliation has been performed." />
                        <StatusBadge label="Expense Payment" color="#f43f5e" desc="Log when a payment is made to a vendor or for operating expenses. Auto-logged by the Day Book." />
                        <StatusBadge label="Cash Reconciliation" color="#8b5cf6" desc="Record end-of-day physical cash count vs system balance verification." />
                        <StatusBadge label="Internal Note" color="#64748b" desc="A general-purpose free-text note for any business event that doesn't fit other categories." />
                    </div>
                </Section>
                <Section title="How to Add an Activity">
                    <StepList steps={[
                        'Click "+ Log Activity" button.',
                        'Select the Activity Type from the dropdown.',
                        'Enter detailed notes in the "Details" field — be specific (who, what, amount if applicable).',
                        'Optionally enter a Reference Number (invoice number, order ID, cheque number, etc.).',
                        'Click "Log Activity". The entry is timestamped and saved immediately.',
                    ]} />
                </Section>
                <Section title="Form Fields Reference">
                    <FieldTable fields={[
                        { name: 'Type', req: true, desc: 'Select the category of the business event from the dropdown.' },
                        { name: 'Details', req: true, desc: 'A full description of the event — what happened, with whom, and any key amounts.' },
                        { name: 'Reference Number', req: false, desc: 'Any reference code: invoice number, cheque number, order ID, etc.' },
                    ]} />
                </Section>
                <Section title="Filtering Activities">
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.83rem', color: 'var(--color-text-secondary)', lineHeight: 1.8 }}>
                        <li><strong>Type filter</strong> — Show only a specific activity category.</li>
                        <li><strong>User filter</strong> — Filter by who recorded the activity (admin-useful).</li>
                        <li><strong>Date filter</strong> — View entries for a specific day.</li>
                        <li><strong>Search bar</strong> — Search by details text or reference number.</li>
                    </ul>
                </Section>
            </div>
        )
    },
    {
        id: 'salaryadvance',
        label: 'Salary Advance',
        icon: Coins,
        keywords: 'salary advance employee pay loan deduct amount date notes search filter',
        content: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <Section title="Purpose">
                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
                        The Salary Advance module records all advance salary payments made to employees before their scheduled payday. It acts as a financial register to track how much each employee has borrowed against their upcoming salary, helping avoid over-payment or missed deductions at the end of the month.
                    </p>
                </Section>
                <Section title="How to Record a Salary Advance">
                    <StepList steps={[
                        'Click the "+ Add Advance" button.',
                        'Enter the exact Employee Name as it appears on payroll.',
                        'Enter the Advance Amount in rupees.',
                        'Set the Date the advance was physically given.',
                        'Add optional Notes — e.g. "Medical emergency — to be deducted from November salary".',
                        'Click "Save Advance" to record it.',
                    ]} />
                </Section>
                <Section title="Form Fields Reference">
                    <FieldTable fields={[
                        { name: 'Date', req: true, desc: 'The calendar date the advance was given (defaults to today).' },
                        { name: 'Employee Name', req: true, desc: 'Full name of the employee receiving the advance.' },
                        { name: 'Amount', req: true, desc: 'The advance amount in rupees.' },
                        { name: 'Notes', req: false, desc: 'Reason for advance, or deduction instructions for payroll.' },
                    ]} />
                </Section>
                <Section title="Editing and Deleting Records">
                    <p style={{ margin: 0, fontSize: '0.83rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                        Each advance record has an <strong>Edit (pencil)</strong> and <strong>Delete (trash)</strong> icon. Click Edit to correct an error in the amount, date, or notes. Click Delete to permanently remove the record — a confirmation prompt will appear first. You can also select multiple records using the checkboxes and use the bulk-delete action.
                    </p>
                </Section>
                <Section title="Filtering Records">
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.83rem', color: 'var(--color-text-secondary)', lineHeight: 1.8 }}>
                        <li><strong>Employee Name search</strong> — Type a name to filter advances for that person.</li>
                        <li><strong>Date range filter</strong> — Set a Start Date and End Date to view advances in a specific period (e.g. for a monthly salary reconciliation).</li>
                    </ul>
                </Section>
                <InfoBox icon={AlertTriangle} color="#f59e0b" title="Important">Salary advance records are for tracking only. The system does not automatically deduct the amount from payroll — payroll deduction must be handled separately in your salary processing.</InfoBox>
            </div>
        )
    },
    {
        id: 'cargolog',
        label: 'Cargo Log',
        icon: Truck,
        keywords: 'cargo delivery truck freight driver party name bill amount pending paid mark payment shipment notes date',
        content: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <Section title="Purpose">
                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
                        The Cargo Log records every outward goods shipment dispatched from the warehouse. It tracks the freight billing, destination party, truck details, and payment status — helping you know exactly which freight bills have been settled and which are still outstanding.
                    </p>
                </Section>
                <Section title="How to Add a Cargo Entry">
                    <StepList steps={[
                        'Click "+ New Entry" to open the cargo form.',
                        'Enter the Date of dispatch.',
                        'Enter the Cargo/Goods Name (what was shipped).',
                        'Enter the Party Name (the receiving business or person).',
                        'Fill in the number of Parts (boxes, bundles, pallets, etc.) if applicable.',
                        'Enter the Freight Amount charged.',
                        'Enter the phone number of the receiver or transport agent.',
                        'Enter the Bill No. from the transport receipt/LR copy.',
                        'Set the Payment Status (default: Pending).',
                        'Add any Notes (e.g. fragile, temperature-sensitive, return consignment).',
                        'Click "Save" to record the entry.',
                    ]} />
                </Section>
                <Section title="Form Fields Reference">
                    <FieldTable fields={[
                        { name: 'Date', req: true, desc: 'Date the cargo was dispatched.' },
                        { name: 'Cargo Name', req: true, desc: 'Description of goods shipped (e.g. "Steel rods", "Textile rolls").' },
                        { name: 'Party Name', req: false, desc: 'Name of the receiving business or customer.' },
                        { name: 'Part Count', req: false, desc: 'Number of boxes, bundles, or units dispatched.' },
                        { name: 'Amount', req: false, desc: 'Freight charge amount in rupees.' },
                        { name: 'Phone No.', req: false, desc: 'Contact number of receiver or transporter.' },
                        { name: 'Bill No.', req: false, desc: 'LR (Lorry Receipt) or transport bill number for tracking.' },
                        { name: 'Payment Status', req: true, desc: 'Pending (not yet paid) or Paid (freight settled).' },
                        { name: 'Notes', req: false, desc: 'Any special instructions or additional information.' },
                    ]} />
                </Section>
                <Section title="Payment Status">
                    <StatusBadge label="Pending" color="#f59e0b" desc="The freight charge has not yet been paid to the transporter or driver. Follow up is needed." />
                    <StatusBadge label="Paid" color="#10b981" desc="Freight has been settled. The system records the timestamp when status was changed to Paid." />
                    <div style={{ marginTop: '10px' }}>
                        <InfoBox icon={Info} color="#6366f1">To mark a shipment as paid, click the <strong>clock/tick icon</strong> on the record row to instantly toggle the payment status without opening the full edit form.</InfoBox>
                    </div>
                </Section>
                <Section title="Filters">
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.83rem', color: 'var(--color-text-secondary)', lineHeight: 1.8 }}>
                        <li><strong>Cargo Name search</strong> — Filter by goods description.</li>
                        <li><strong>Party Name search</strong> — Filter by receiving party.</li>
                        <li><strong>Bill No. search</strong> — Look up a specific LR number.</li>
                        <li><strong>Payment Status</strong> — Show only Pending or only Paid shipments.</li>
                        <li><strong>Date Range</strong> — Filter dispatches between two dates.</li>
                    </ul>
                </Section>
            </div>
        )
    },
    {
        id: 'vendors',
        label: 'Vendor Statements',
        icon: FileCheck,
        keywords: 'vendor supplier statement received period status correct discrepancy outstanding notes assigned',
        content: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <Section title="Purpose">
                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
                        The Vendor Statements module tracks whether monthly account statements have been received from each supplier, and whether they have been verified and matched against the internal ledger. This prevents surprise discrepancies during supplier audits or year-end reconciliation.
                    </p>
                </Section>
                <Section title="How to Add a Vendor Statement">
                    <StepList steps={[
                        'Click "+ Add Statement".',
                        'Enter the Vendor Name (e.g. "Arjun Textiles Pvt Ltd").',
                        'Enter the Period (e.g. "July 2026").',
                        'Toggle Statement Received to Yes if you have the statement in hand.',
                        'Set the Status after verification.',
                        'Enter the person Assigned To for follow-up if discrepancy exists.',
                        'Add Notes for any issues or memo.',
                        'Click "Save Statement".',
                    ]} />
                </Section>
                <Section title="Form Fields Reference">
                    <FieldTable fields={[
                        { name: 'Vendor Name', req: true, desc: 'The name of the supplier as per purchase records.' },
                        { name: 'Period', req: false, desc: 'Month and year the statement covers (e.g. "July 2026").' },
                        { name: 'Statement Received', req: false, desc: 'Toggle Yes/No — marks whether you have the physical or emailed statement.' },
                        { name: 'Status', req: true, desc: 'The reconciliation status after reviewing the statement.' },
                        { name: 'Assigned To', req: false, desc: 'Staff member name responsible for resolving any issue.' },
                        { name: 'Notes', req: false, desc: 'Specific discrepancy details, follow-up dates, or memo.' },
                    ]} />
                </Section>
                <Section title="Status Values">
                    <StatusBadge label="Correct" color="#10b981" desc="Statement received and all figures match the internal purchase ledger. No action needed." />
                    <StatusBadge label="Discrepancy" color="#f43f5e" desc="Figures don't match — a difference exists between the vendor's records and your books. Requires follow-up." />
                    <StatusBadge label="Outstanding" color="#f59e0b" desc="Statement has not yet been received or verified. Payment may be withheld until clarification." />
                    <StatusBadge label="Unknown" color="#64748b" desc="Status not yet determined — statement is being reviewed." />
                </Section>
                <Section title="Filters">
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.83rem', color: 'var(--color-text-secondary)', lineHeight: 1.8 }}>
                        <li><strong>Vendor Name</strong> — Search for a specific supplier.</li>
                        <li><strong>Statement Received</strong> — Filter by received (Yes) or not received (No).</li>
                        <li><strong>Period</strong> — Filter by statement month/year.</li>
                        <li><strong>Status</strong> — Show only Correct, Discrepancy, Outstanding, or Unknown records.</li>
                    </ul>
                </Section>
            </div>
        )
    },
    {
        id: 'cheques',
        label: 'Cheque Register',
        icon: FileText,
        keywords: 'cheque number vendor issue date amount status issued cleared bounced cancelled notes bank',
        content: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <Section title="Purpose">
                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
                        The Cheque Register keeps a digital record of every cheque issued by the business. It prevents the risk of missed cheque clearances, double payments, or undetected bounced cheques that could affect bank reconciliation.
                    </p>
                </Section>
                <Section title="How to Add a Cheque Entry">
                    <StepList steps={[
                        'Click "+ New Cheque".',
                        'Enter the Issue Date (when the cheque was written).',
                        'The system auto-suggests the next cheque number based on existing records — verify and correct if needed.',
                        'Enter the Vendor/Payee Name.',
                        'Enter the Cheque Date (date printed on the cheque — may differ from issue date for post-dated cheques).',
                        'Enter the Amount.',
                        'Set the Status (default: Issued).',
                        'Add Notes (e.g. "Post-dated cheque for November rent").',
                        'Click "Save Cheque".',
                    ]} />
                </Section>
                <Section title="Form Fields Reference">
                    <FieldTable fields={[
                        { name: 'Issue Date', req: true, desc: 'The date the cheque was physically written and handed over.' },
                        { name: 'Cheque No.', req: true, desc: 'The printed cheque number from the cheque book leaf.' },
                        { name: 'Vendor Name', req: true, desc: 'The payee — the person or company the cheque is made out to.' },
                        { name: 'Cheque Date', req: true, desc: 'The date printed on the cheque (for post-dated cheques, this is a future date).' },
                        { name: 'Amount', req: true, desc: 'The cheque value in rupees.' },
                        { name: 'Status', req: true, desc: 'Current state of the cheque (see below).' },
                        { name: 'Notes', req: false, desc: 'Additional context — purpose, post-dating reason, or bank instructions.' },
                    ]} />
                </Section>
                <Section title="Cheque Status Values">
                    <StatusBadge label="Issued" color="#6366f1" desc="Cheque has been written and given to the payee, but has not yet been presented to the bank." />
                    <StatusBadge label="Cleared" color="#10b981" desc="The bank has processed the cheque and funds have been successfully debited from your account." />
                    <StatusBadge label="Bounced" color="#f43f5e" desc="The cheque was returned unpaid — typically due to insufficient funds or signature mismatch. Requires immediate action." />
                    <StatusBadge label="Cancelled" color="#64748b" desc="The cheque was voided before being presented — mark cancelled to keep the register accurate." />
                    <div style={{ marginTop: '10px' }}>
                        <InfoBox icon={AlertTriangle} color="#f43f5e" title="Bounced Cheque Action">If a cheque bounces, immediately record it as Bounced in the register, contact the payee, and consult your bank about re-presenting or legal action as needed.</InfoBox>
                    </div>
                </Section>
                <Section title="Auto-Suggest Cheque Number">
                    <p style={{ margin: 0, fontSize: '0.83rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                        When you open the new cheque form, the system automatically calculates the next cheque number by finding the highest existing cheque number in the register and incrementing it by 1. Always verify this matches your physical cheque book.
                    </p>
                </Section>
                <Section title="Filters">
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.83rem', color: 'var(--color-text-secondary)', lineHeight: 1.8 }}>
                        <li><strong>Cheque No. search</strong> — Find a specific cheque leaf.</li>
                        <li><strong>Vendor Name search</strong> — See all cheques issued to a payee.</li>
                        <li><strong>Status filter</strong> — Show only Issued, Cleared, Bounced, or Cancelled cheques.</li>
                        <li><strong>Date Range</strong> — Filter by issue date or cheque date range.</li>
                    </ul>
                </Section>
            </div>
        )
    },
    {
        id: 'tasks',
        label: 'Tasks & Reminders',
        icon: CheckSquare,
        keywords: 'task reminder due date title description pending completed toggle delete',
        content: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <Section title="Purpose">
                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
                        The Tasks & Reminders module is a lightweight to-do list for tracking work that needs to be done — cheque deposits, vendor follow-ups, bank visits, document submissions, or any other time-sensitive business action.
                    </p>
                </Section>
                <Section title="How to Create a Task">
                    <StepList steps={[
                        'Click "+ Add Task".',
                        'Enter a clear Task Title (e.g. "Deposit cheque no. 004521 by Friday").',
                        'Add a Description with full context and instructions.',
                        'Set the Due Date.',
                        'Click "Add Task". The task appears in the list with Pending status.',
                    ]} />
                </Section>
                <Section title="Form Fields Reference">
                    <FieldTable fields={[
                        { name: 'Title', req: true, desc: 'A short, clear name for the task — visible in the Dashboard pending count.' },
                        { name: 'Description', req: false, desc: 'Detailed instructions or context for completing the task.' },
                        { name: 'Due Date', req: true, desc: 'The deadline by which the task must be completed.' },
                    ]} />
                </Section>
                <Section title="Managing Tasks">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <InfoBox icon={CheckCircle} color="#10b981" title="Mark Complete">Click the circular check button on any task to toggle it between Pending and Completed. Completed tasks are visually struck through.</InfoBox>
                        <InfoBox icon={AlertTriangle} color="#f43f5e" title="Delete Task">Click the trash icon to permanently delete a task. This cannot be undone.</InfoBox>
                        <InfoBox icon={Info} color="#6366f1" title="Filter by Status">Use the Pending / Completed / All filter buttons at the top to quickly switch views.</InfoBox>
                    </div>
                </Section>
                <InfoBox icon={Info} color="#f59e0b" title="Dashboard Integration">The total number of Pending tasks is shown on the Dashboard's stat card — so even without opening this module, you can see if there is outstanding work.</InfoBox>
            </div>
        )
    },
    {
        id: 'staff',
        label: 'Staff Management',
        icon: Users,
        keywords: 'staff register add user role designation email password generate reset send email admin only',
        content: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <InfoBox icon={Shield} color="#6366f1" title="Admin Only">This module is only visible and accessible to Administrators. Accounts Staff cannot access Staff Management.</InfoBox>
                <Section title="Purpose">
                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
                        Staff Management allows administrators to register new portal users, configure their role and designation, and manage their login credentials — including generating or resetting passwords.
                    </p>
                </Section>
                <Section title="How to Register a New Staff Member">
                    <StepList steps={[
                        { title: 'Click "+ Register Staff"', desc: 'Opens the registration modal.' },
                        { title: 'Enter Full Name', desc: 'The staff member\'s full name as it should appear in the CRM.' },
                        { title: 'Enter Email Address', desc: 'This becomes their login email. Must be unique in the system.' },
                        { title: 'Generate or Enter Password', desc: 'Click "Generate Password" to auto-create a secure 12-character password, or type one manually. The password will be shown on screen after generation.' },
                        { title: 'Select Role', desc: 'Choose Admin (full access) or Staff (restricted access).' },
                        { title: 'Select Designation', desc: 'Choose from the designations configured in Master Data (e.g. Store Manager, Accountant).' },
                        { title: 'Click "Register Staff"', desc: 'The account is created and a welcome email with login credentials is sent automatically to their email address.' },
                    ]} />
                </Section>
                <Section title="Form Fields Reference">
                    <FieldTable fields={[
                        { name: 'Full Name', req: true, desc: 'Display name used throughout the CRM.' },
                        { name: 'Email', req: true, desc: 'Login email — must be unique across the system.' },
                        { name: 'Password', req: true, desc: 'Min. 8 characters. Use "Generate Password" for a secure auto-generated one.' },
                        { name: 'Role', req: true, desc: 'Admin (full access) or Staff (limited access).' },
                        { name: 'Designation', req: false, desc: 'Job title from Master Data designations list.' },
                    ]} />
                </Section>
                <Section title="Password Management">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <InfoBox icon={CheckCircle} color="#6366f1" title="Generate Password (on Registration)">Click "Generate Password" in the registration form to auto-fill a 12-character secure random password. The password is shown on screen — copy it before saving if needed. It is also sent via email.</InfoBox>
                        <InfoBox icon={CheckCircle} color="#f59e0b" title="Reset Password (existing staff)">On the staff list, click the "Reset Password" button on any staff card. Enter a new password manually or click "Generate" to auto-create one. Submit to update the password and automatically send the new credentials to their email.</InfoBox>
                        <InfoBox icon={AlertTriangle} color="#f43f5e" title="Security Note">Passwords are hashed and stored securely. Even admins cannot view existing passwords — only reset them.</InfoBox>
                    </div>
                </Section>
            </div>
        )
    },
    {
        id: 'masterdata',
        label: 'Master Data',
        icon: Database,
        keywords: 'master data categories designations add edit delete inflow outflow tag label staff title job',
        content: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <InfoBox icon={Shield} color="#6366f1" title="Admin Only">Master Data management is restricted to Administrators only.</InfoBox>
                <Section title="Purpose">
                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
                        Master Data is the configuration foundation of the CRM. It contains two types of records: <strong>Categories</strong> (used to classify Day Book transactions) and <strong>Designations</strong> (used to label staff job roles).
                    </p>
                </Section>
                <Section title="Transaction Categories">
                    <p style={{ margin: '0 0 10px', fontSize: '0.83rem', color: 'var(--color-text-secondary)' }}>
                        Categories allow you to group transactions meaningfully for reporting. Each category must be assigned a type — Inflow or Outflow — to ensure it only appears in the correct transaction type dropdown.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                        <div className="card" style={{ padding: '12px', borderLeft: '3px solid var(--color-success)' }}>
                            <strong style={{ fontSize: '0.83rem', color: 'var(--color-success)' }}>Inflow Categories (examples)</strong>
                            <ul style={{ margin: '6px 0 0', paddingLeft: '16px', fontSize: '0.78rem', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
                                <li>Customer Payment</li>
                                <li>Owner Capital</li>
                                <li>Bank Interest</li>
                                <li>GST Refund</li>
                            </ul>
                        </div>
                        <div className="card" style={{ padding: '12px', borderLeft: '3px solid var(--color-danger)' }}>
                            <strong style={{ fontSize: '0.83rem', color: 'var(--color-danger)' }}>Outflow Categories (examples)</strong>
                            <ul style={{ margin: '6px 0 0', paddingLeft: '16px', fontSize: '0.78rem', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
                                <li>Supplier Payment</li>
                                <li>Rent & Utilities</li>
                                <li>Freight Charges</li>
                                <li>Staff Salary</li>
                            </ul>
                        </div>
                    </div>
                    <StepList steps={[
                        'Click "+ Add Category".',
                        'Enter a clear Category Name.',
                        'Select Type: Inflow or Outflow.',
                        'Click "Create Category".',
                    ]} />
                    <div style={{ marginTop: '10px' }}>
                        <InfoBox icon={AlertTriangle} color="#f43f5e" title="Deleting Categories">Deleting a category that is already used by existing transactions may cause those transactions to lose their category label. Add new categories; avoid deleting old ones if they have transaction history.</InfoBox>
                    </div>
                </Section>
                <Section title="Designations">
                    <p style={{ margin: '0 0 10px', fontSize: '0.83rem', color: 'var(--color-text-secondary)' }}>
                        Designations are job title labels applied to staff accounts (e.g. Store Manager, Cashier, Accountant, Delivery Supervisor). They are informational only and do not affect system permissions.
                    </p>
                    <FieldTable fields={[
                        { name: 'Name', req: true, desc: 'The job title label (e.g. "Head Accountant").' },
                        { name: 'Description', req: false, desc: 'A brief description of the role\'s responsibilities.' },
                    ]} />
                </Section>
            </div>
        )
    },
    {
        id: 'profile',
        label: 'My Profile',
        icon: UserCircle,
        keywords: 'profile name email update change password current new confirm save',
        content: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <Section title="Purpose">
                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
                        Every logged-in user can view and update their own personal profile information and change their password from the My Profile page. Role and Designation can only be changed by an Administrator.
                    </p>
                </Section>
                <Section title="Profile Info Tab">
                    <FieldTable fields={[
                        { name: 'Full Name', req: true, desc: 'Your display name in the CRM. Updating this changes your name in all activity log entries going forward.' },
                        { name: 'Email Address', req: true, desc: 'Your login email. Must be unique — if changed, use the new email to log in next time.' },
                        { name: 'Access Role', req: false, desc: 'Displayed only — Admin or Staff. Can only be changed by an Admin.' },
                        { name: 'Designation', req: false, desc: 'Displayed only — your job title. Can only be changed by an Admin.' },
                    ]} />
                </Section>
                <Section title="Change Password Tab">
                    <StepList steps={[
                        'Click the "Change Password" tab.',
                        'Enter your Current Password to verify identity.',
                        'Enter the New Password (minimum 8 characters).',
                        'Confirm the New Password by repeating it.',
                        'Click "Update Password". You will remain logged in.',
                    ]} />
                    <div style={{ marginTop: '10px' }}>
                        <InfoBox icon={AlertTriangle} color="#f59e0b" title="Password Reset by Admin">If you forget your current password, contact your Administrator to reset it. A new password will be sent to your registered email address.</InfoBox>
                    </div>
                </Section>
            </div>
        )
    },
    {
        id: 'crmsettings',
        label: 'CRM Settings',
        icon: Settings,
        keywords: 'settings company name phone email address gst currency timezone date format preferences security admin',
        content: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <InfoBox icon={Shield} color="#6366f1" title="Admin Only">CRM Settings is restricted to Administrators.</InfoBox>
                <Section title="Purpose">
                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
                        CRM Settings allows the administrator to configure company-wide information and application preferences that are used throughout the portal.
                    </p>
                </Section>
                <Section title="Company Information">
                    <FieldTable fields={[
                        { name: 'Company Name', req: true, desc: 'Official registered business name — appears in reports and email footers.' },
                        { name: 'Company Phone', req: false, desc: 'Primary business contact number.' },
                        { name: 'Company Email', req: false, desc: 'Business email address for correspondence.' },
                        { name: 'Company Address', req: false, desc: 'Full registered address including city, state, and PIN.' },
                        { name: 'GST Number', req: false, desc: '15-character GSTIN for tax compliance records.' },
                        { name: 'Currency Symbol', req: false, desc: 'The currency symbol shown on amounts (default: ₹).' },
                        { name: 'Country', req: false, desc: 'Country of operation (default: India).' },
                    ]} />
                </Section>
                <Section title="App Preferences">
                    <FieldTable fields={[
                        { name: 'Date Format', req: false, desc: 'How dates are displayed in the CRM (e.g. DD/MM/YYYY for India).' },
                        { name: 'Timezone', req: false, desc: 'System timezone for timestamps (default: Asia/Kolkata for IST).' },
                    ]} />
                </Section>
            </div>
        )
    },
];

/* ─── Main Component ─────────────────────────────────────────────────── */

const KnowledgeBase = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('overview');

    const topics = useMemo(() => buildTopics(), []);

    const filteredTopics = useMemo(() =>
        topics.filter(t =>
            !searchQuery ||
            t.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.keywords.toLowerCase().includes(searchQuery.toLowerCase())
        ), [topics, searchQuery]);

    // If the active tab is filtered out, switch to first visible one
    const visibleActiveTab = filteredTopics.find(t => t.id === activeTab)
        ? activeTab
        : filteredTopics[0]?.id;

    const activeTopic = topics.find(t => t.id === visibleActiveTab);

    return (
        <div style={{ padding: '4px 0', maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header */}
            <div className="card" style={{
                padding: '24px 28px', display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', flexWrap: 'wrap', gap: '16px',
                background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(99,102,241,0.06) 100%)'
            }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <BookOpen size={22} color="var(--color-accent)" />
                        CRM Knowledge Base
                    </h2>
                    <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                        Complete A–Z guide to all modules, workflows, fields, and settings in Balancely CRM.
                    </p>
                </div>
                <div style={{ position: 'relative', width: '100%', maxWidth: '340px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search topics (e.g. password, cheque, cargo)..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        style={{ paddingLeft: '36px' }}
                    />
                </div>
            </div>

            {/* Body */}
            <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>

                {/* Sidebar */}
                <div className="card" style={{ flex: '0 0 230px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '2px', position: 'sticky', top: '20px' }}>
                    <div style={{ padding: '8px 14px 6px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {filteredTopics.length} Topic{filteredTopics.length !== 1 ? 's' : ''}
                    </div>
                    {filteredTopics.map(t => {
                        const Icon = t.icon;
                        const isActive = visibleActiveTab === t.id;
                        return (
                            <button
                                key={t.id}
                                onClick={() => setActiveTab(t.id)}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '9px 12px', borderRadius: '8px', border: 'none',
                                    background: isActive ? 'rgba(99,102,241,0.12)' : 'transparent',
                                    color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                                    fontWeight: isActive ? '700' : '500',
                                    fontSize: '0.83rem', cursor: 'pointer',
                                    transition: 'all 0.15s', textAlign: 'left', width: '100%'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                                    <Icon size={15} />
                                    <span>{t.label}</span>
                                </div>
                                {isActive && <ChevronRight size={13} />}
                            </button>
                        );
                    })}
                    {filteredTopics.length === 0 && (
                        <div style={{ padding: '16px', fontSize: '0.8rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                            No topics match.
                        </div>
                    )}
                </div>

                {/* Content */}
                {activeTopic && (
                    <div className="card" style={{ flex: 1, padding: '28px', minHeight: '500px' }}>
                        <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <activeTopic.icon size={20} color="var(--color-accent)" />
                            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>{activeTopic.label}</h3>
                        </div>
                        {activeTopic.content}
                    </div>
                )}
            </div>
        </div>
    );
};

export default KnowledgeBase;
