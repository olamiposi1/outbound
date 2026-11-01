export type ParsedLead = {
  company: string;
  website: string | null;
  contact_name: string | null;
  contact_role: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  segment_name: string | null;
};

export type ParseResult = {
  leads: ParsedLead[];
  skipped: number;
  error: string | null;
};

const MAX_ROWS = 500;
const MAX_LEN = 200;

// Column names we accept for each field, written without spaces or symbols
const ALIASES: Record<keyof ParsedLead, string[]> = {
  company: ['company', 'companyname', 'business', 'businessname', 'organization', 'organisation'],
  website: ['website', 'site', 'url', 'web', 'domain', 'websiteurl'],
  contact_name: ['contact', 'contactname', 'fullname', 'person', 'owner', 'ownername'],
  contact_role: ['role', 'title', 'position', 'jobtitle', 'contactrole'],
  email: ['email', 'emailaddress', 'mail', 'contactemail'],
  phone: ['phone', 'phonenumber', 'tel', 'telephone', 'mobile'],
  address: ['address', 'location', 'city', 'area'],
  segment_name: ['segment', 'category', 'type', 'industry'],
};

function normalizeHeader(h: string): string {
  return h.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function splitCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  const src = text.replace(/^\uFEFF/, '');

  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(field);
      field = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && src[i + 1] === '\n') i++;
      row.push(field);
      field = '';
      rows.push(row);
      row = [];
    } else {
      field += ch;
    }
  }
  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((r) => r.some((c) => c.trim() !== ''));
}

export function parseLeadsCsv(text: string): ParseResult {
  const rows = splitCsv(text);
  if (rows.length < 2) {
    return { leads: [], skipped: 0, error: 'The file needs a header row and at least one lead.' };
  }

  const headers = rows[0].map(normalizeHeader);
  const col: Partial<Record<keyof ParsedLead, number>> = {};

  (Object.keys(ALIASES) as (keyof ParsedLead)[]).forEach((key) => {
    const idx = headers.findIndex((h) => ALIASES[key].includes(h));
    if (idx !== -1) col[key] = idx;
  });

  // A plain "Name" column is treated as the business name when nothing better exists
  if (col.company === undefined) {
    const idx = headers.indexOf('name');
    if (idx !== -1) col.company = idx;
  }

  if (col.company === undefined) {
    return {
      leads: [],
      skipped: 0,
      error: 'Could not find a column for the business name. Name it "Company" or "Business name".',
    };
  }

  const dataRows = rows.slice(1);
  if (dataRows.length > MAX_ROWS) {
    return { leads: [], skipped: 0, error: `Please upload up to ${MAX_ROWS} leads at a time.` };
  }

  const get = (r: string[], key: keyof ParsedLead): string | null => {
    const i = col[key];
    if (i === undefined) return null;
    const v = (r[i] ?? '').trim().slice(0, MAX_LEN);
    return v === '' ? null : v;
  };

  const leads: ParsedLead[] = [];
  let skipped = 0;

  for (const r of dataRows) {
    const company = get(r, 'company');
    if (!company) {
      skipped++;
      continue;
    }

    const rawEmail = get(r, 'email');
    const email =
      rawEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail) ? rawEmail.toLowerCase() : null;

    const rawSite = get(r, 'website');
    const website = rawSite
      ? rawSite.replace(/^https?:\/\//i, '').replace(/\/+$/, '').toLowerCase()
      : null;

    leads.push({
      company,
      website: website && website.includes('.') ? website : null,
      contact_name: get(r, 'contact_name'),
      contact_role: get(r, 'contact_role'),
      email,
      phone: get(r, 'phone'),
      address: get(r, 'address'),
      segment_name: get(r, 'segment_name'),
    });
  }

  return { leads, skipped, error: null };
}