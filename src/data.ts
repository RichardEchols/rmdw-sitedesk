export const attentionItems = [
  {
    kind: 'request',
    title: 'New request',
    detail: 'Spalled concrete at drainage edge',
    property: 'Riverbend Storage — Building C',
    meta: '8:24 AM',
  },
  {
    kind: 'schedule',
    title: 'Schedule exception',
    detail: 'Start window needs confirmation',
    property: 'Pinecrest Plaza · Unit 12',
    meta: 'Yesterday',
  },
  {
    kind: 'quote',
    title: 'Quote approval',
    detail: 'Drainage-edge repair',
    property: 'Lakeside Commons · Building A',
    meta: '$1,860',
  },
]

export const activeJobs = [
  {
    id: 'JOB-2521',
    property: 'Riverbend Storage — Building C',
    location: 'Drive aisle · Units C118–C126',
    time: 'Today · 8:00 AM – 11:00 AM',
    status: 'In progress',
    tech: 'Jordan Lee',
    image: 'before',
  },
  {
    id: 'JOB-2522',
    property: 'Pinecrest Plaza',
    location: 'Unit 12 · Rooftop access',
    time: 'Today · 12:00 PM – 2:00 PM',
    status: 'Scheduled',
    tech: 'Amari Brooks',
    image: 'roof',
  },
  {
    id: 'JOB-2523',
    property: 'Harborview Office Park',
    location: 'Building B · Lobby',
    time: 'Today · 1:00 PM – 3:00 PM',
    status: 'In progress',
    tech: 'Jordan Lee',
    image: 'during',
  },
  {
    id: 'JOB-2524',
    property: 'Lakeside Commons',
    location: 'Building A · North entrance',
    time: 'Tomorrow · 9:00 AM – 11:00 AM',
    status: 'Scheduled',
    tech: 'Nia Thomas',
    image: 'after',
  },
]

export const quoteLines = [
  { description: 'Remove loose concrete and prep drainage edge', amount: 480 },
  { description: 'Form and install high-strength repair material', amount: 960 },
  { description: 'Finish, cure protection, and site cleanup', amount: 420 },
]

export const timeline = [
  { label: 'Request received', time: 'Aug 11 · 8:24 AM', done: true },
  { label: 'Job assigned to Jordan Lee', time: 'Aug 11 · 8:41 AM', done: true },
  { label: 'Technician on site', time: 'Aug 11 · 9:08 AM', done: true },
  { label: 'Repair documented', time: 'Aug 11 · 10:32 AM', done: false },
]

export const properties = [
  {
    customer: 'Northline Storage Group',
    properties: 14,
    contact: 'Dana Pierce · Regional facilities manager',
    locations: ['Riverbend Storage', 'Oak Mill Storage', 'Westhaven Storage'],
    openJobs: 3,
  },
  {
    customer: 'Meridian Commercial Partners',
    properties: 6,
    contact: 'Elliot Cole · Property manager',
    locations: ['Pinecrest Plaza', 'Harborview Office Park'],
    openJobs: 2,
  },
  {
    customer: 'Lakeside Asset Management',
    properties: 9,
    contact: 'Sofia Reed · Portfolio operations',
    locations: ['Lakeside Commons', 'Juniper Retail Center'],
    openJobs: 1,
  },
]
