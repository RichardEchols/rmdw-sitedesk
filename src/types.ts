export type View = 'office' | 'request' | 'technician' | 'quote' | 'closeout'

export type OfficeSection =
  | 'Today'
  | 'Requests'
  | 'Jobs'
  | 'Schedule'
  | 'Quotes'
  | 'Customers'

export type WorkflowState = {
  requestSubmitted: boolean
  requestConverted: boolean
  afterPhotoAdded: boolean
  jobCompleted: boolean
  quoteApproved: boolean
}

export type NavigationProps = {
  onNavigate: (view: View) => void
}
